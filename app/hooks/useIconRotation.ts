import { useEffect } from 'react'
import { DeviceMotionOrientation } from 'expo-sensors'
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useDeviceOrientation } from './useDeviceOrientation'

interface UseIconRotationOptions {
  /** Animation damping (default: 20) */
  damping?: number
  /** Animation stiffness (default: 300) */
  stiffness?: number
  /** Whether to enable the rotation (default: true) */
  enabled?: boolean
}

/**
 * Custom hook for rotating icons based on device orientation
 * Uses DeviceMotionOrientation enums for proper orientation handling
 * 
 * @param options Configuration options for the rotation behavior
 * @returns Object containing animated style and current orientation
 */
export function useIconRotation(options: UseIconRotationOptions = {}) {
  const {
    damping = 20,
    stiffness = 300,
    enabled = true
  } = options

  const deviceOrientation = useDeviceOrientation()
  const iconRotation = useSharedValue(0)

  useEffect(() => {
    if (!enabled) return

    // Map DeviceMotionOrientation enum values directly to rotation angles
    // According to docs: Portrait=0, RightLandscape=90, LeftLandscape=-90, UpsideDown=180
    let rotationAngle = 0
    
    switch (deviceOrientation) {
      case DeviceMotionOrientation.Portrait:
        rotationAngle = 0
        break
      case DeviceMotionOrientation.RightLandscape:
        rotationAngle = 90
        break
      case DeviceMotionOrientation.LeftLandscape:
        rotationAngle = -90
        break
      default:
        rotationAngle = 0
    }
    
    iconRotation.value = withSpring(rotationAngle, {
      damping,
      stiffness,
    })
  }, [deviceOrientation, enabled, damping, stiffness, iconRotation])

  // Create animated style for icon rotation
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }))

  return {
    animatedIconStyle,
    deviceOrientation,
    iconRotation,
  }
}
