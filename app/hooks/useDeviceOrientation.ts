import { useState, useEffect, useRef } from 'react'
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
  
  const lastUpdateTime = useRef<number>(0)
  const debounceDelay = 1000 // 1 second debounce

  useEffect(() => {
    let subscription: any

    const startAccelerometer = async () => {
      // Set update interval to 1 second to reduce frequency and prevent loops
      Accelerometer.setUpdateInterval(1000)
      
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const now = Date.now()
        
        // Debounce updates to prevent excessive re-renders
        if (now - lastUpdateTime.current < debounceDelay) {
          return
        }
        
        lastUpdateTime.current = now
        
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

        // Only update state if orientation actually changed to prevent unnecessary re-renders
        setOrientation(prevOrientation => {
          if (prevOrientation.orientation !== newOrientation.orientation) {
            return newOrientation
          }
          return prevOrientation
        })
      })
    }

    startAccelerometer()

    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [debounceDelay])

  return orientation
}
