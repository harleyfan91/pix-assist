/**
 * Centralized error handling service for the PixAssist application.
 * Provides unified error management, reporting, and recovery strategies.
 */

import { AppError, ErrorCategory, ErrorSeverity, ErrorRecoveryAction, ErrorHandlerConfig, ErrorRecoveryResult } from './types'
import { reportCrash, ErrorType } from '../../utils/crashReporting'

class ErrorService {
  private static instance: ErrorService
  private errorHandlers: Map<ErrorCategory, (error: AppError) => void> = new Map()
  private recoveryStrategies: Map<ErrorCategory, (error: AppError) => Promise<ErrorRecoveryResult>> = new Map()

  private constructor() {
    this.initializeDefaultHandlers()
    this.initializeRecoveryStrategies()
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  /**
   * Creates a standardized error from various error sources
   */
  createError(
    category: ErrorCategory,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    originalError?: Error
  ): AppError {
    const baseError: AppError = {
      id: this.generateErrorId(),
      category,
      severity,
      message,
      userMessage,
      timestamp: Date.now(),
      context,
      originalError,
      isRecoverable: this.isRecoverable(category, severity),
      recoveryAction: this.getRecoveryAction(category, severity),
    }

    return this.enrichErrorByCategory(baseError)
  }

  /**
   * Handles an error with the appropriate strategy
   */
  handleError(error: AppError, config: ErrorHandlerConfig = {}): void {
    const defaultConfig: ErrorHandlerConfig = {
      showToast: true,
      showModal: severity >= ErrorSeverity.HIGH,
      logToConsole: true,
      reportToService: severity >= ErrorSeverity.MEDIUM,
      autoRecover: error.isRecoverable && severity < ErrorSeverity.CRITICAL,
      recoveryDelay: 2000,
    }

    const finalConfig = { ...defaultConfig, ...config }

    // Log error
    if (finalConfig.logToConsole) {
      this.logError(error)
    }

    // Report to crash service
    if (finalConfig.reportToService) {
      this.reportError(error)
    }

    // Execute category-specific handler
    const handler = this.errorHandlers.get(error.category)
    if (handler) {
      handler(error)
    }

    // Auto-recovery for recoverable errors
    if (finalConfig.autoRecover && error.isRecoverable) {
      setTimeout(() => {
        this.attemptRecovery(error)
      }, finalConfig.recoveryDelay)
    }
  }

  /**
   * Attempts to recover from an error
   */
  async attemptRecovery(error: AppError): Promise<ErrorRecoveryResult> {
    const strategy = this.recoveryStrategies.get(error.category)
    if (!strategy) {
      return { success: false, error, retryCount: 0 }
    }

    try {
      return await strategy(error)
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError)
      return { success: false, error, retryCount: 0 }
    }
  }

  /**
   * Registers a custom error handler for a specific category
   */
  registerErrorHandler(category: ErrorCategory, handler: (error: AppError) => void): void {
    this.errorHandlers.set(category, handler)
  }

  /**
   * Registers a custom recovery strategy for a specific category
   */
  registerRecoveryStrategy(category: ErrorCategory, strategy: (error: AppError) => Promise<ErrorRecoveryResult>): void {
    this.recoveryStrategies.set(category, strategy)
  }

  private initializeDefaultHandlers(): void {
    // Network error handler
    this.errorHandlers.set(ErrorCategory.NETWORK, (error) => {
      console.warn('Network error:', error.message)
    })

    // Permission error handler
    this.errorHandlers.set(ErrorCategory.PERMISSION, (error) => {
      console.warn('Permission error:', error.message)
    })

    // Camera error handler
    this.errorHandlers.set(ErrorCategory.CAMERA, (error) => {
      console.warn('Camera error:', error.message)
    })

    // Template error handler
    this.errorHandlers.set(ErrorCategory.TEMPLATE, (error) => {
      console.warn('Template error:', error.message)
    })

    // Storage error handler
    this.errorHandlers.set(ErrorCategory.STORAGE, (error) => {
      console.warn('Storage error:', error.message)
    })

    // Validation error handler
    this.errorHandlers.set(ErrorCategory.VALIDATION, (error) => {
      console.warn('Validation error:', error.message)
    })
  }

  private initializeRecoveryStrategies(): void {
    // Network recovery strategy
    this.recoveryStrategies.set(ErrorCategory.NETWORK, async (error) => {
      // Simple retry for network errors
      return { success: true, retryCount: 1 }
    })

    // Camera recovery strategy
    this.recoveryStrategies.set(ErrorCategory.CAMERA, async (error) => {
      // Camera recovery logic would go here
      return { success: true, retryCount: 1 }
    })

    // Template recovery strategy
    this.recoveryStrategies.set(ErrorCategory.TEMPLATE, async (error) => {
      // Template recovery logic would go here
      return { success: true, retryCount: 1 }
    })
  }

  private enrichErrorByCategory(error: AppError): AppError {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return {
          ...error,
          statusCode: error.context?.statusCode,
          isTimeout: error.message.includes('timeout') || error.message.includes('TIMEOUT'),
          isConnectionError: error.message.includes('connection') || error.message.includes('network'),
        } as any

      case ErrorCategory.PERMISSION:
        return {
          ...error,
          permissionType: error.context?.permissionType || 'camera',
          canRequestPermission: error.context?.canRequestPermission ?? true,
        } as any

      case ErrorCategory.CAMERA:
        return {
          ...error,
          errorType: this.determineCameraErrorType(error),
        } as any

      case ErrorCategory.TEMPLATE:
        return {
          ...error,
          templateId: error.context?.templateId,
          operation: error.context?.operation || 'load',
        } as any

      case ErrorCategory.STORAGE:
        return {
          ...error,
          operation: error.context?.operation || 'read',
          key: error.context?.key,
        } as any

      case ErrorCategory.VALIDATION:
        return {
          ...error,
          field: error.context?.field,
          value: error.context?.value,
          rule: error.context?.rule,
        } as any

      default:
        return error
    }
  }

  private determineCameraErrorType(error: AppError): 'capture_failed' | 'device_unavailable' | 'permission_denied' | 'hardware_error' {
    const message = error.message.toLowerCase()
    
    if (message.includes('permission') || message.includes('denied')) {
      return 'permission_denied'
    }
    if (message.includes('device') || message.includes('unavailable')) {
      return 'device_unavailable'
    }
    if (message.includes('capture') || message.includes('photo')) {
      return 'capture_failed'
    }
    if (message.includes('hardware') || message.includes('avfoundation')) {
      return 'hardware_error'
    }
    
    return 'capture_failed'
  }

  private isRecoverable(category: ErrorCategory, severity: ErrorSeverity): boolean {
    if (severity === ErrorSeverity.CRITICAL) return false
    
    const recoverableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.CAMERA,
      ErrorCategory.TEMPLATE,
      ErrorCategory.STORAGE,
    ]
    
    return recoverableCategories.includes(category)
  }

  private getRecoveryAction(category: ErrorCategory, severity: ErrorSeverity): ErrorRecoveryAction {
    if (severity === ErrorSeverity.CRITICAL) {
      return ErrorRecoveryAction.RESTART_APP
    }

    switch (category) {
      case ErrorCategory.NETWORK:
        return ErrorRecoveryAction.RETRY
      case ErrorCategory.PERMISSION:
        return ErrorRecoveryAction.PERMISSION_REQUEST
      case ErrorCategory.CAMERA:
        return ErrorRecoveryAction.RESET
      case ErrorCategory.TEMPLATE:
        return ErrorRecoveryAction.REFRESH
      case ErrorCategory.STORAGE:
        return ErrorRecoveryAction.RETRY
      default:
        return ErrorRecoveryAction.NONE
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logError(error: AppError): void {
    const logMessage = `[${error.category.toUpperCase()}] ${error.message}`
    
    switch (error.severity) {
      case ErrorSeverity.LOW:
        console.log(logMessage)
        break
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage)
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        console.error(logMessage)
        break
    }
  }

  private reportError(error: AppError): void {
    if (error.originalError) {
      const errorType = error.severity === ErrorSeverity.CRITICAL ? ErrorType.FATAL : ErrorType.HANDLED
      reportCrash(error.originalError, errorType)
    }
  }
}

export const errorService = ErrorService.getInstance()
