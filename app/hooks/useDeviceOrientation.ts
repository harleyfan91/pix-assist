import { useState, useEffect } from 'react'
import { Accelerometer } from 'expo-sensors'

export interface DeviceOrientation {
  isLandscape: boolean
  isPortrait: boolean
  orientation: 'portrait' | 'landscape-left' | 'landscape-right' | 'portrait-upside-down'
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    isLandscape: false,
    isPortrait: true,
    orientation: 'portrait'
  })

  useEffect(() => {
    let subscription: any

    const startAccelerometer = async () => {
      // Set update interval to 100ms for responsive detection
      Accelerometer.setUpdateInterval(100)
      
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // Calculate orientation based on accelerometer values
        const absX = Math.abs(x)
        const absY = Math.abs(y)
        const absZ = Math.abs(z)

        let newOrientation: DeviceOrientation

        if (absX > absY && absX > absZ) {
          // Device is rotated around X axis (landscape)
          if (x > 0) {
            newOrientation = {
              isLandscape: true,
              isPortrait: false,
              orientation: 'landscape-right'
            }
          } else {
            newOrientation = {
              isLandscape: true,
              isPortrait: false,
              orientation: 'landscape-left'
            }
          }
        } else if (absY > absX && absY > absZ) {
          // Device is rotated around Y axis (portrait)
          if (y > 0) {
            newOrientation = {
              isLandscape: false,
              isPortrait: true,
              orientation: 'portrait-upside-down'
            }
          } else {
            newOrientation = {
              isLandscape: false,
              isPortrait: true,
              orientation: 'portrait'
            }
          }
        } else {
          // Default to portrait if unclear
          newOrientation = {
            isLandscape: false,
            isPortrait: true,
            orientation: 'portrait'
          }
        }

        setOrientation(newOrientation)
      })
    }

    startAccelerometer()

    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [])

  return orientation
}
