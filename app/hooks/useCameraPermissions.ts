import { useState, useEffect, useCallback } from 'react'
import { Alert, Linking } from 'react-native'
import { useCameraPermission } from 'react-native-vision-camera'
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
    try {
      setIsLoading(true)
      setError(null)
      
      log.camera.info('Requesting camera permission...')
      
      const permission = await visionCameraRequestPermission()
      
      if (permission) {
        log.camera.info('Camera permission granted')
        setIsDenied(false)
      } else {
        log.camera.warn('Camera permission denied by user')
        setIsDenied(true)
      }
      
      return permission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      log.camera.error('Failed to request camera permission', { error: errorMessage })
      setError(errorMessage)
      setIsDenied(true)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [visionCameraRequestPermission])

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      log.camera.info('Opening device settings for camera permission')
      await Linking.openSettings()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open settings'
      log.camera.error('Failed to open device settings', { error: errorMessage })
      setError(errorMessage)
    }
  }, [])

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
