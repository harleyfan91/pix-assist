import { errorService } from '../error/ErrorService'
import { ErrorCategory, ErrorSeverity } from '../error/types'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  operation?: string
  component?: string
  userId?: string
  sessionId?: string
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: number
  category?: ErrorCategory
}

class LogService {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory
  private isDevelopment = __DEV__

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * Log camera-related operations
   */
  camera(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'camera' })
  }

  /**
   * Log template-related operations
   */
  template(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'template' })
  }

  /**
   * Log EXIF-related operations
   */
  exif(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'exif' })
  }

  /**
   * Log gallery-related operations
   */
  gallery(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'gallery' })
  }

  /**
   * Log navigation-related operations
   */
  navigation(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'navigation' })
  }

  /**
   * Log storage-related operations
   */
  storage(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { ...context, component: 'storage' })
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      category: this.getCategoryFromContext(context)
    }

    // Add to in-memory logs
    this.logs.push(logEntry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift() // Remove oldest log
    }

    // Output to console in development
    if (this.isDevelopment) {
      this.outputToConsole(logEntry)
    }

    // For errors, also report to error service
    if (level === LogLevel.ERROR) {
      this.reportErrorToService(logEntry)
    }
  }

  /**
   * Output log entry to console with appropriate styling
   */
  private outputToConsole(entry: LogEntry): void {
    const { level, message, context, timestamp } = entry
    const timeStr = new Date(timestamp).toISOString().split('T')[1].split('.')[0]
    const contextStr = context ? ` [${JSON.stringify(context)}]` : ''
    
    const logMessage = `[${timeStr}] [${level.toUpperCase()}] ${message}${contextStr}`

    switch (level) {
      case LogLevel.DEBUG:
        console.log(logMessage)
        break
      case LogLevel.INFO:
        console.log(logMessage)
        break
      case LogLevel.WARN:
        console.warn(logMessage)
        break
      case LogLevel.ERROR:
        console.error(logMessage)
        break
    }
  }

  /**
   * Report error logs to the error service
   */
  private reportErrorToService(entry: LogEntry): void {
    if (entry.category) {
      const appError = errorService.createError(
        entry.category,
        entry.message,
        entry.message,
        ErrorSeverity.LOW,
        entry.context,
        new Error(entry.message)
      )
      errorService.handleError(appError)
    }
  }

  /**
   * Get error category from log context
   */
  private getCategoryFromContext(context?: LogContext): ErrorCategory | undefined {
    if (!context?.component) return undefined

    switch (context.component) {
      case 'camera':
        return ErrorCategory.CAMERA
      case 'template':
        return ErrorCategory.TEMPLATE
      case 'exif':
      case 'storage':
        return ErrorCategory.STORAGE
      case 'gallery':
        return ErrorCategory.GALLERY
      case 'navigation':
        return ErrorCategory.NAVIGATION
      default:
        return undefined
    }
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.context?.component === component)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Export singleton instance
export const logService = new LogService()

// Export convenience functions for common use cases
export const log = {
  debug: (message: string, context?: LogContext) => logService.debug(message, context),
  info: (message: string, context?: LogContext) => logService.info(message, context),
  warn: (message: string, context?: LogContext) => logService.warn(message, context),
  error: (message: string, context?: LogContext) => logService.error(message, context),
  camera: (message: string, context?: LogContext) => logService.camera(message, context),
  template: (message: string, context?: LogContext) => logService.template(message, context),
  exif: (message: string, context?: LogContext) => logService.exif(message, context),
  gallery: (message: string, context?: LogContext) => logService.gallery(message, context),
  navigation: (message: string, context?: LogContext) => logService.navigation(message, context),
  storage: (message: string, context?: LogContext) => logService.storage(message, context),
}
