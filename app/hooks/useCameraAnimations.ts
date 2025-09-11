import { useSharedValue, useAnimatedStyle, useAnimatedProps, useDerivedValue, interpolate, runOnJS } from "react-native-reanimated"
import { Camera } from "react-native-vision-camera"

export interface UseCameraAnimationsProps {
  device: any // Camera device from react-native-vision-camera
  zoom: any // Shared value for zoom
  zoomOffset: any // Shared value for zoom offset
  popupVisible: any // Shared value for popup visibility
  // From useCameraControls hook
  cameraModeExpansion: any
  flashAnimation: any
  exposureControlsAnimation: any
  exposureSlider: any
  // From useCameraGestures hook
  focusRingOpacity: any
  focusRingPosition: any
  // State setters
  setCameraZoom: (zoom: number) => void
}

export const useCameraAnimations = ({
  device,
  zoom,
  zoomOffset,
  popupVisible,
  cameraModeExpansion,
  flashAnimation,
  exposureControlsAnimation,
  exposureSlider,
  focusRingOpacity,
  focusRingPosition,
  setCameraZoom
}: UseCameraAnimationsProps) => {
  // Preview animation shared value
  const previewAnimation = useSharedValue(0) // 0 = hidden, 1 = visible

  // Update camera zoom when zoom value changes using derived value
  useDerivedValue(() => {
    try {
      runOnJS(setCameraZoom)(zoom.value)
    } catch (error) {
      console.log('Camera zoom update error:', error)
      // Don't update camera zoom on error
    }
  })

  // Map exposure slider to device exposure range (conservative range)
  const exposureValue = useDerivedValue(() => {
    if (!device) return 0
    // Map slider value (-1 to 1) to a conservative portion of device exposure range
    const range = device.maxExposure - device.minExposure
    const conservativeRange = range * 0.25 // Use 25% of the full range
    const mappedValue = interpolate(exposureSlider.value, [-1, 0, 1], [-conservativeRange/2, 0, conservativeRange/2])
    
    // Debug logging
    console.log('Exposure mapping:', {
      sliderValue: exposureSlider.value.toFixed(2),
      mappedValue: mappedValue.toFixed(2),
      deviceRange: range.toFixed(2),
      conservativeRange: conservativeRange.toFixed(2)
    })
    
    return mappedValue
  }, [exposureSlider, device])

  // Create animated props for camera exposure
  const animatedCameraProps = useAnimatedProps(() => ({
    exposure: exposureValue.value,
  }), [exposureValue])

  // Create animated style for camera mode button expansion
  const animatedCameraModeStyle = useAnimatedStyle(() => {
    const expandedHeight = 200 // Height for 3 controls + padding
    const collapsedHeight = 60 // Original button height
    
    return {
      height: interpolate(
        cameraModeExpansion.value,
        [0, 1],
        [collapsedHeight, expandedHeight]
      ),
      // No translateY - let it expand naturally from bottom
    }
  })

  // Create animated style for camera control icons opacity
  const animatedCameraControlsOpacity = useAnimatedStyle(() => ({
    opacity: cameraModeExpansion.value,
  }))

  // Animated style for flash effect
  const animatedFlashStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(flashAnimation.value, [0, 1], [0, 0.6]),
    }
  })

  // Animated style for preview
  const animatedPreviewStyle = useAnimatedStyle(() => {
    return {
      opacity: previewAnimation.value,
      scale: interpolate(previewAnimation.value, [0, 1], [0.9, 1]),
      translateY: interpolate(previewAnimation.value, [0, 1], [50, 0]),
    }
  })

  // Create animated style for focus ring
  const animatedFocusRingStyle = useAnimatedStyle(() => ({
    opacity: focusRingOpacity.value,
    transform: [
      { translateX: focusRingPosition.value.x - 50 }, // Center the ring
      { translateY: focusRingPosition.value.y - 50 },
    ],
  }))

  // Create animated style for chevron positioning
  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      // Use transform to center when collapsed and flip when expanded
      transform: [
        {
          translateY: interpolate(
            cameraModeExpansion.value,
            [0, 1],
            [-8, 0] // Move up 8px when collapsed to center it in 60px button
          )
        },
        {
          scaleY: interpolate(
            cameraModeExpansion.value,
            [0, 1],
            [1, -1] // Flip vertically when expanded (1 = normal, -1 = flipped)
          )
        }
      ],
    }
  })

  // Create animated style for popup visibility and positioning
  const animatedPopupStyle = useAnimatedStyle(() => {
    return {
      opacity: popupVisible.value,
      transform: [
        {
          scale: interpolate(
            popupVisible.value,
            [0, 1],
            [0.7, 1]
          )
        }
      ],
    }
  })

  // Create animated style for exposure controls (slide from bottom + scale)
  const animatedExposureControlsStyle = useAnimatedStyle(() => {
    return {
      opacity: exposureControlsAnimation.value,
      transform: [
        {
          scale: interpolate(
            exposureControlsAnimation.value,
            [0, 1],
            [0.9, 1] // Slight scale animation
          )
        },
        {
          translateY: interpolate(
            exposureControlsAnimation.value,
            [0, 1],
            [50, 0] // Slide up from 50px below
          )
        }
      ],
    }
  })

  return {
    // Shared values
    previewAnimation,
    
    // Derived values
    exposureValue,
    
    // Animated props
    animatedCameraProps,
    
    // Animated styles
    animatedCameraModeStyle,
    animatedCameraControlsOpacity,
    animatedFlashStyle,
    animatedPreviewStyle,
    animatedFocusRingStyle,
    animatedChevronStyle,
    animatedPopupStyle,
    animatedExposureControlsStyle,
  }
}
