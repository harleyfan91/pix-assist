/**
 * Error context provider for global error state management.
 * Provides centralized error handling and display coordination.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { AppError, ErrorState, ErrorCategory, ErrorSeverity, ErrorRecoveryAction } from '../services/error/types'
import { errorService } from '../services/error/ErrorService'

interface ErrorContextType {
  errorState: ErrorState
  showError: (error: AppError) => void
  hideError: () => void
  clearErrors: () => void
  attemptRecovery: (error: AppError) => Promise<void>
  createAndShowError: (
    category: ErrorCategory,
    message: string,
    userMessage: string,
    severity?: ErrorSeverity,
    context?: Record<string, any>,
    originalError?: Error
  ) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

interface ErrorAction {
  type: 'SHOW_ERROR' | 'HIDE_ERROR' | 'CLEAR_ERRORS' | 'ADD_ERROR'
  payload?: AppError
}

const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'SHOW_ERROR':
      if (!action.payload) return state
      return {
        ...state,
        errors: [...state.errors, action.payload],
        isErrorVisible: true,
        currentError: action.payload,
      }
    
    case 'HIDE_ERROR':
      return {
        ...state,
        isErrorVisible: false,
        currentError: null,
      }
    
    case 'CLEAR_ERRORS':
      return {
        errors: [],
        isErrorVisible: false,
        currentError: null,
      }
    
    case 'ADD_ERROR':
      if (!action.payload) return state
      return {
        ...state,
        errors: [...state.errors, action.payload],
      }
    
    default:
      return state
  }
}

const initialState: ErrorState = {
  errors: [],
  isErrorVisible: false,
  currentError: null,
}

interface ErrorProviderProps {
  children: ReactNode
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorState, dispatch] = useReducer(errorReducer, initialState)

  const showError = useCallback((error: AppError) => {
    dispatch({ type: 'SHOW_ERROR', payload: error })
    
    // Handle the error through the service
    errorService.handleError(error, {
      showToast: true,
      showModal: error.severity >= ErrorSeverity.HIGH,
      logToConsole: true,
      reportToService: error.severity >= ErrorSeverity.MEDIUM,
      autoRecover: error.isRecoverable && error.severity < ErrorSeverity.CRITICAL,
    })
  }, [])

  const hideError = useCallback(() => {
    dispatch({ type: 'HIDE_ERROR' })
  }, [])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const attemptRecovery = useCallback(async (error: AppError) => {
    try {
      const result = await errorService.attemptRecovery(error)
      if (result.success) {
        console.log(`Successfully recovered from ${error.category} error`)
        hideError()
      } else {
        console.warn(`Recovery failed for ${error.category} error`)
      }
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError)
    }
  }, [hideError])

  const createAndShowError = useCallback((
    category: ErrorCategory,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    originalError?: Error
  ) => {
    const error = errorService.createError(
      category,
      message,
      userMessage,
      severity,
      context,
      originalError
    )
    showError(error)
  }, [showError])

  const contextValue: ErrorContextType = {
    errorState,
    showError,
    hideError,
    clearErrors,
    attemptRecovery,
    createAndShowError,
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Convenience hooks for specific error types
export const useErrorHandler = () => {
  const { createAndShowError, attemptRecovery } = useError()
  
  return {
    handleError: createAndShowError,
    recover: attemptRecovery,
  }
}

export const useErrorState = () => {
  const { errorState, hideError, clearErrors } = useError()
  
  return {
    errors: errorState.errors,
    currentError: errorState.currentError,
    isErrorVisible: errorState.isErrorVisible,
    hideError,
    clearErrors,
  }
}
