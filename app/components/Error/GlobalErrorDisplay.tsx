/**
 * Global error display component that manages error toasts and modals.
 * Should be placed at the root level of the app to display all errors.
 */

import React, { useEffect, useState } from 'react'
import { ErrorToast } from './ErrorToast'
import { ErrorModal } from './ErrorModal'
import { useError } from '@/contexts/ErrorContext'
import { ErrorSeverity } from '@/services/error/types'

export const GlobalErrorDisplay: React.FC = () => {
  const { errorState, hideError, attemptRecovery } = useError()
  const [toastError, setToastError] = useState<any>(null)

  // Handle error display based on severity
  useEffect(() => {
    if (errorState.currentError) {
      const error = errorState.currentError
      
      if (error.severity >= ErrorSeverity.HIGH) {
        // High severity errors show as modals
        setToastError(null)
      } else {
        // Lower severity errors show as toasts
        setToastError(error)
        
        // Auto-hide toast after a delay
        const timer = setTimeout(() => {
          setToastError(null)
          hideError()
        }, 5000)
        
        return () => clearTimeout(timer)
      }
    } else {
      setToastError(null)
    }
  }, [errorState.currentError, hideError])

  const handleToastDismiss = () => {
    setToastError(null)
    hideError()
  }

  const handleModalDismiss = () => {
    hideError()
  }

  const handleRecovery = async () => {
    if (errorState.currentError) {
      await attemptRecovery(errorState.currentError)
    }
  }

  return (
    <>
      {/* Error Toast */}
      {toastError && (
        <ErrorToast
          error={toastError}
          onDismiss={handleToastDismiss}
          duration={5000}
        />
      )}

      {/* Error Modal */}
      {errorState.isErrorVisible && 
       errorState.currentError && 
       errorState.currentError.severity >= ErrorSeverity.HIGH && (
        <ErrorModal
          error={errorState.currentError}
          onDismiss={handleModalDismiss}
          onRecover={errorState.currentError.isRecoverable ? handleRecovery : undefined}
          visible={true}
        />
      )}
    </>
  )
}
