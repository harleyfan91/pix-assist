import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { DeviceMotion, DeviceMotionOrientation } from 'expo-sensors'

/**
 * Custom hook that provides normalized device orientation
 * Handles iOS orientation mapping to ensure consistent behavior across platforms
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceMotionOrientation>(DeviceMotionOrientation.Portrait)

  useEffect(() => {
    const subscription = DeviceMotion.addListener(({ orientation: rawOrientation }) => {
      // Apply iOS-specific mapping if needed
      let normalizedOrientation = rawOrientation
      
      if (Platform.OS === 'ios') {
        // iOS reports orientations opposite to expected
        switch (rawOrientation) {
          case DeviceMotionOrientation.LeftLandscape:
            normalizedOrientation = DeviceMotionOrientation.RightLandscape
            break
          case DeviceMotionOrientation.RightLandscape:
            normalizedOrientation = DeviceMotionOrientation.LeftLandscape
            break
          default:
            // Portrait and UpsideDown remain the same
            normalizedOrientation = rawOrientation
        }
      }
      
      setOrientation(normalizedOrientation)
    })

    return () => subscription.remove()
  }, [])

  return orientation
}
