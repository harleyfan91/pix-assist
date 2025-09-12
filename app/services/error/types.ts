/**
 * Centralized error types and categories for the PixAssist application.
 * This provides a unified approach to error handling across the entire app.
 */

export enum ErrorCategory {
  NETWORK = 'network',
  PERMISSION = 'permission',
  CAMERA = 'camera',
  TEMPLATE = 'template',
  GALLERY = 'gallery',
  STORAGE = 'storage',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorRecoveryAction {
  RETRY = 'retry',
  REFRESH = 'refresh',
  RESET = 'reset',
  PERMISSION_REQUEST = 'permission_request',
  NAVIGATE_BACK = 'navigate_back',
  RESTART_APP = 'restart_app',
  NONE = 'none',
}

export interface BaseError {
  id: string
  category: ErrorCategory
  severity: ErrorSeverity
  message: string
  userMessage: string
  timestamp: number
  context?: Record<string, any>
  originalError?: Error
  recoveryAction?: ErrorRecoveryAction
  isRecoverable: boolean
}

export interface NetworkError extends BaseError {
  category: ErrorCategory.NETWORK
  statusCode?: number
  isTimeout: boolean
  isConnectionError: boolean
}

export interface PermissionError extends BaseError {
  category: ErrorCategory.PERMISSION
  permissionType: 'camera' | 'photo_library' | 'storage'
  canRequestPermission: boolean
}

export interface CameraError extends BaseError {
  category: ErrorCategory.CAMERA
  errorType: 'capture_failed' | 'device_unavailable' | 'permission_denied' | 'hardware_error'
  isRecoverable: boolean
}

export interface TemplateError extends BaseError {
  category: ErrorCategory.TEMPLATE
  templateId?: string
  operation: 'load' | 'activate' | 'deactivate' | 'save' | 'delete'
}

export interface StorageError extends BaseError {
  category: ErrorCategory.STORAGE
  operation: 'read' | 'write' | 'delete' | 'clear'
  key?: string
}

export interface ValidationError extends BaseError {
  category: ErrorCategory.VALIDATION
  field?: string
  value?: any
  rule?: string
}

export type AppError = 
  | NetworkError 
  | PermissionError 
  | CameraError 
  | TemplateError 
  | StorageError 
  | ValidationError

export interface ErrorState {
  errors: AppError[]
  isErrorVisible: boolean
  currentError: AppError | null
}

export interface ErrorHandlerConfig {
  showToast?: boolean
  showModal?: boolean
  logToConsole?: boolean
  reportToService?: boolean
  autoRecover?: boolean
  recoveryDelay?: number
}

export interface ErrorRecoveryResult {
  success: boolean
  error?: AppError
  retryCount: number
}
