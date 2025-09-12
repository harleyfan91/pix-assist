/**
 * Custom hooks for error handling throughout the application.
 * Provides convenient methods for common error handling patterns.
 */

import { useCallback } from 'react'
import { AppError, ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { useError } from '@/contexts/ErrorContext'

/**
 * Hook for handling async operations with automatic error handling.
 * Wraps async functions with try-catch and standardized error handling.
 */
export const useErrorHandler = () => {
  const { createAndShowError, attemptRecovery } = useError()

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorConfig: {
      category: ErrorCategory
      userMessage: string
      severity?: ErrorSeverity
      context?: Record<string, any>
      onError?: (error: AppError) => void
      onSuccess?: (result: T) => void
    }
  ): Promise<T | null> => {
    try {
      const result = await asyncFn()
      errorConfig.onSuccess?.(result)
      return result
    } catch (error) {
      createAndShowError(
        errorConfig.category,
        error instanceof Error ? error.message : String(error),
        errorConfig.userMessage,
        errorConfig.severity || ErrorSeverity.MEDIUM,
        errorConfig.context,
        error instanceof Error ? error : undefined
      )
      
      // Create a mock error object for the callback
      const mockError = {
        id: `error_${Date.now()}`,
        category: errorConfig.category,
        severity: errorConfig.severity || ErrorSeverity.MEDIUM,
        message: error instanceof Error ? error.message : String(error),
        userMessage: errorConfig.userMessage,
        timestamp: Date.now(),
        context: errorConfig.context,
        originalError: error instanceof Error ? error : undefined,
        isRecoverable: true,
        recoveryAction: undefined,
      }
      
      errorConfig.onError?.(mockError as any)
      return null
    }
  }, [createAndShowError])

  const handleCameraError = useCallback((error: Error, context?: Record<string, any>) => {
    return createAndShowError(
      ErrorCategory.CAMERA,
      error.message,
      'Camera error occurred. Please try again.',
      ErrorSeverity.MEDIUM,
      context,
      error
    )
  }, [createAndShowError])

  const handleTemplateError = useCallback((error: Error, operation: string, templateId?: string) => {
    return createAndShowError(
      ErrorCategory.TEMPLATE,
      error.message,
      `Failed to ${operation} template. Please try again.`,
      ErrorSeverity.MEDIUM,
      { operation, templateId },
      error
    )
  }, [createAndShowError])

  const handleNetworkError = useCallback((error: Error, context?: Record<string, any>) => {
    return createAndShowError(
      ErrorCategory.NETWORK,
      error.message,
      'Network error. Please check your connection and try again.',
      ErrorSeverity.MEDIUM,
      context,
      error
    )
  }, [createAndShowError])

  const handlePermissionError = useCallback((permissionType: string, error?: Error) => {
    return createAndShowError(
      ErrorCategory.PERMISSION,
      error?.message || 'Permission denied',
      `Please grant ${permissionType} permission to continue.`,
      ErrorSeverity.HIGH,
      { permissionType },
      error
    )
  }, [createAndShowError])

  const handleStorageError = useCallback((error: Error, operation: string, key?: string) => {
    return createAndShowError(
      ErrorCategory.STORAGE,
      error.message,
      `Failed to ${operation} data. Please try again.`,
      ErrorSeverity.MEDIUM,
      { operation, key },
      error
    )
  }, [createAndShowError])

  return {
    handleAsync,
    handleCameraError,
    handleTemplateError,
    handleNetworkError,
    handlePermissionError,
    handleStorageError,
    attemptRecovery,
  }
}

/**
 * Hook for managing error state in components.
 * Provides error state management and recovery actions.
 */
export const useErrorState = () => {
  const { errorState, hideError, clearErrors } = useError()

  return {
    errors: errorState.errors,
    currentError: errorState.currentError,
    isErrorVisible: errorState.isErrorVisible,
    hasErrors: errorState.errors.length > 0,
    hideError,
    clearErrors,
  }
}

/**
 * Hook for error recovery operations.
 * Provides methods to attempt recovery from different types of errors.
 */
export const useErrorRecovery = () => {
  const { attemptRecovery } = useError()

  const recoverFromCameraError = useCallback(async () => {
    // Camera-specific recovery logic
    console.log('Attempting camera recovery...')
    // This would typically involve resetting camera state, etc.
  }, [])

  const recoverFromTemplateError = useCallback(async () => {
    // Template-specific recovery logic
    console.log('Attempting template recovery...')
    // This would typically involve reloading templates, etc.
  }, [])

  const recoverFromNetworkError = useCallback(async () => {
    // Network-specific recovery logic
    console.log('Attempting network recovery...')
    // This would typically involve retrying the failed request
  }, [])

  return {
    attemptRecovery,
    recoverFromCameraError,
    recoverFromTemplateError,
    recoverFromNetworkError,
  }
}

/**
 * Hook for wrapping async operations with error handling.
 * Simplifies the common pattern of try-catch with error display.
 */
export const useAsyncWithError = () => {
  const { handleAsync } = useErrorHandler()

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorConfig: {
      category: ErrorCategory
      userMessage: string
      severity?: ErrorSeverity
      context?: Record<string, any>
    }
  ) => {
    return handleAsync(asyncFn, errorConfig)
  }, [handleAsync])

  return {
    executeWithErrorHandling,
  }
}
