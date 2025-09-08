import { useState, useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getOrientation = async () => {
      try {
        const currentOrientation = await ScreenOrientation.getOrientationAsync()
        setOrientation(currentOrientation)
        console.log('Initial orientation:', currentOrientation)
      } catch (error) {
        console.error('Error getting orientation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getOrientation()

    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      console.log('Orientation changed:', event.orientationInfo.orientation)
      setOrientation(event.orientationInfo.orientation)
    })

    return () => {
      subscription?.remove()
    }
  }, [])

  const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                     orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT

  const isPortrait = orientation === ScreenOrientation.Orientation.PORTRAIT_UP || 
                    orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN

  return {
    orientation,
    isLandscape,
    isPortrait,
    isLoading,
  }
}
