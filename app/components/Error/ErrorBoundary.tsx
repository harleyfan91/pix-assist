/**
 * Enhanced error boundary component that integrates with the centralized error system.
 * Handles React component errors and displays them using the unified error UI.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import { AppError, ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { errorService } from '@/services/error/ErrorService'

interface Props {
  children: ReactNode
  catchErrors: "always" | "dev" | "prod" | "never"
  fallback?: ReactNode
}

interface State {
  error: AppError | null
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { 
    error: null, 
    hasError: false 
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Create a standardized error from the React error
    const appError = errorService.createError(
      ErrorCategory.UNKNOWN,
      error.message,
      'Something went wrong. Please try again.',
      ErrorSeverity.HIGH,
      { 
        componentStack: error.stack,
        errorBoundary: true 
      },
      error
    )

    return {
      error: appError,
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only handle errors if enabled
    if (!this.isEnabled()) {
      return
    }

    // Create a more detailed error with component stack
    const appError = errorService.createError(
      ErrorCategory.UNKNOWN,
      error.message,
      'An unexpected error occurred. The app will try to recover.',
      ErrorSeverity.HIGH,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorName: error.name,
      },
      error
    )

    this.setState({ error: appError })

    // Handle the error through the service
    errorService.handleError(appError, {
      showToast: false, // Error boundary handles its own display
      showModal: false,
      logToConsole: true,
      reportToService: true,
      autoRecover: false, // Let user manually retry
    })
  }

  private isEnabled(): boolean {
    return (
      this.props.catchErrors === "always" ||
      (this.props.catchErrors === "dev" && __DEV__) ||
      (this.props.catchErrors === "prod" && !__DEV__)
    )
  }

  private handleRetry = () => {
    this.setState({ 
      error: null, 
      hasError: false 
    })
  }

  private handleGoBack = () => {
    // This would typically navigate back or to a safe screen
    // For now, just reset the error state
    this.setState({ 
      error: null, 
      hasError: false 
    })
  }

  render() {
    if (this.state.hasError && this.state.error && this.isEnabled()) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use the unified error state component
      return (
        <ErrorState
          error={this.state.error}
          onRetry={this.handleRetry}
          onGoBack={this.handleGoBack}
          showDetails={__DEV__}
        />
      )
    }

    return this.props.children
  }
}
