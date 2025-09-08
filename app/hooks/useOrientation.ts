import { useState, useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

export const useOrientation = () => {
  // Since screen orientation is locked to portrait, we return static values
  const [orientation] = useState<ScreenOrientation.Orientation>(ScreenOrientation.Orientation.PORTRAIT_UP)
  const [isLoading] = useState(false)

  // Screen orientation is locked at app level, so we don't need to listen for changes
  const isLandscape = false
  const isPortrait = true

  return {
    orientation,
    isLandscape,
    isPortrait,
    isLoading,
  }
}
