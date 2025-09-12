/**
 * Refactored CameraScreen demonstrating the new error handling system.
 * This shows how to migrate existing error handling patterns to the centralized system.
 * 
 * NOTE: This is a demonstration file. The actual CameraScreen.tsx would be updated
 * incrementally to avoid breaking changes.
 */

import { FC, useCallback, useEffect, useState, useRef } from "react"
import { Alert, Linking, TouchableOpacity, View, ViewStyle, TextStyle, ImageStyle, StyleSheet, Modal, Image } from "react-native"
// ... other imports remain the same

import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { ErrorState } from '@/components/Error/ErrorState'

export const CameraScreenRefactored: FC = function CameraScreenRefactored() {
  // ... existing state variables remain the same
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isTemplateDrawerVisible, setIsTemplateDrawerVisible] = useState(false)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  
  // NEW: Use centralized error handling
  const { handleAsync, handleCameraError, handleTemplateError } = useErrorHandler()
  const [hasError, setHasError] = useState(false)
  const [currentError, setCurrentError] = useState<any>(null)

  // ... other existing hooks and state remain the same

  // REFACTORED: Template selection with centralized error handling
  const handleTemplateSelect = useCallback(async (templateId: string) => {
    const result = await handleAsync(
      async () => {
        setCurrentTemplateId(templateId)
        await activateTemplate(templateId)
        setIsTemplateDrawerVisible(false)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to select template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'select', templateId },
        onError: (error) => {
          setHasError(true)
          setCurrentError(error)
        },
        onSuccess: () => {
          setHasError(false)
          setCurrentError(null)
        },
      }
    )
  }, [handleAsync, activateTemplate])

  // REFACTORED: Photo capture with centralized error handling
  const takePhoto = useCallback(async () => {
    if (isCapturing || !device || !_cameraRef.current) return

    const result = await handleAsync(
      async () => {
        setIsCapturing(true)
        setCaptureFlash(true)
        
        // Trigger flash animation
        flashAnimation.value = withTiming(1, { duration: 100 }, () => {
          flashAnimation.value = withTiming(0, { duration: 200 })
        })

        // Take photo
        const photo = await _cameraRef.current!.takePhoto({
          flash: flashMode,
          enableAutoRedEye: true,
          enableAutoStabilization: true,
        })

        // Write EXIF data
        const photoPath = `file://${photo.path}`
        await writeAsync(photoPath, {
          // EXIF data here
        })

        // Navigate to PreviewScreen
        navigation.navigate('Preview', { photoPath })
      },
      {
        category: ErrorCategory.CAMERA,
        userMessage: 'Failed to take photo. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'capture' },
        onError: (error) => {
          setHasError(true)
          setCurrentError(error)
          
          // Handle specific camera recovery
          if (error.context?.errorType === 'hardware_error') {
            console.log("AVFoundation error detected - attempting camera recovery")
            setCameraError("Camera temporarily unavailable")
            
            // Try to recover by briefly pausing and resuming camera
            setIsActive(false)
            setTimeout(() => {
              console.log("Attempting camera recovery...")
              setIsActive(true)
              setCameraError(null)
            }, 2000)
          }
        },
        onSuccess: () => {
          setHasError(false)
          setCurrentError(null)
        },
      }
    )

    if (!result) {
      // Show user-friendly error message
      Alert.alert(
        "Camera Error",
        "Unable to take photo. Please try again.",
        [{ text: "OK" }]
      )
    }

    setIsCapturing(false)
    setCaptureFlash(false)
    flashAnimation.value = 0
  }, [isCapturing, flashAnimation, device, _cameraRef, flashMode, navigation, handleAsync])

  // REFACTORED: Camera error recovery
  const recoverFromCameraError = useCallback(() => {
    console.log("Attempting camera recovery from zoom error...")
    
    // Use centralized error handling for recovery
    handleCameraError(
      new Error('Camera recovery initiated'),
      { operation: 'recovery', reason: 'zoom_error' }
    )
    
    setCameraError("Camera temporarily unavailable")
    setIsActive(false)
    
    setTimeout(() => {
      console.log("Attempting camera recovery...")
      setIsActive(true)
      setCameraError(null)
    }, 2000)
  }, [handleCameraError])

  // ... rest of the component logic remains the same

  // NEW: Error state rendering
  if (hasError && currentError) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <ErrorState
          error={currentError}
          onRetry={() => {
            setHasError(false)
            setCurrentError(null)
            // Retry the failed operation
          }}
          onGoBack={() => {
            navigation.goBack()
          }}
          showDetails={__DEV__}
        />
      </Screen>
    )
  }

  // ... rest of the render logic remains the same
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      {/* ... existing camera UI remains the same */}
    </Screen>
  )
}

// ... existing styles remain the same
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#0b0b0b",
}
