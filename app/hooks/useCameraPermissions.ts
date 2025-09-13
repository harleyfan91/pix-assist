import { useState, useEffect, useCallback } from 'react'
import { Alert, Linking } from 'react-native'
import { useCameraPermission } from 'react-native-vision-camera'
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { log } from '@/services/logging'

export interface CameraPermissionState {
  /** Whether permission is currently being checked */
  isLoading: boolean
  /** Whether camera permission has been granted */
  hasPermission: boolean
  /** Whether permission has been explicitly denied */
  isDenied: boolean
  /** Error message if permission request failed */
  error: string | null
}

export interface CameraPermissionActions {
  /** Request camera permission from the user */
  requestPermission: () => Promise<boolean>
  /** Open device settings for manual permission grant */
  openSettings: () => Promise<void>
  /** Reset permission state (useful for retry scenarios) */
  reset: () => void
}

export interface UseCameraPermissionsReturn extends CameraPermissionState, CameraPermissionActions {}

/**
 * Custom hook for managing camera permissions
 * 
 * Provides a clean interface for:
 * - Checking permission status
 * - Requesting permissions
 * - Handling permission denial
 * - Opening settings for manual permission grant
 * 
 * @returns CameraPermissionState and CameraPermissionActions
 */
export const useCameraPermissions = (): UseCameraPermissionsReturn => {
  const { hasPermission, requestPermission: visionCameraRequestPermission } = useCameraPermission()
  const { handleAsync } = useErrorHandler()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isDenied, setIsDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update loading state when permission status changes
  useEffect(() => {
    if (hasPermission !== null) {
      setIsLoading(false)
      setIsDenied(!hasPermission)
      setError(null)
    }
  }, [hasPermission])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    log.camera.info('Requesting camera permission...')
    
    const result = await handleAsync(
      async () => {
        const permission = await visionCameraRequestPermission()
        
        if (permission) {
          log.camera.info('Camera permission granted')
          setIsDenied(false)
        } else {
          log.camera.warn('Camera permission denied by user')
          setIsDenied(true)
        }
        
        return permission
      },
      {
        category: ErrorCategory.PERMISSION,
        userMessage: 'Failed to request camera permission. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { permissionType: 'camera' },
        onError: (error) => {
          setError(error.message)
          setIsDenied(true)
        }
      }
    )
    
    setIsLoading(false)
    return result ?? false
  }, [visionCameraRequestPermission, handleAsync])

  const openSettings = useCallback(async (): Promise<void> => {
    log.camera.info('Opening device settings for camera permission')
    
    await handleAsync(
      async () => {
        await Linking.openSettings()
      },
      {
        category: ErrorCategory.PERMISSION,
        userMessage: 'Failed to open device settings. Please manually go to Settings > Privacy & Security > Camera.',
        severity: ErrorSeverity.LOW,
        context: { action: 'openSettings' },
        onError: (error) => {
          setError(error.message)
        }
      }
    )
  }, [handleAsync])

  const reset = useCallback(() => {
    log.camera.info('Resetting camera permission state')
    setIsLoading(true)
    setIsDenied(false)
    setError(null)
  }, [])

  return {
    // State
    isLoading,
    hasPermission: hasPermission ?? false,
    isDenied,
    error,
    
    // Actions
    requestPermission,
    openSettings,
    reset,
  }
}

/**
 * Hook for showing permission request UI with proper error handling
 * 
 * This is a convenience hook that combines permission logic with UI prompts
 */
export const useCameraPermissionPrompt = () => {
  const permissions = useCameraPermissions()

  const promptForPermission = useCallback(async (): Promise<boolean> => {
    if (permissions.hasPermission) {
      return true
    }

    const granted = await permissions.requestPermission()

    if (!granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to take photos. Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Open Settings", 
            onPress: () => permissions.openSettings() 
          },
        ],
      )
    }

    return granted
  }, [permissions])

  return {
    ...permissions,
    promptForPermission,
  }
}
