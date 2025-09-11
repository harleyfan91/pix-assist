import { useMemo } from 'react'
import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Critical constant: Camera viewfinder uses 82% of screen height
// This was empirically determined through visual analysis
const VIEWFINDER_HEIGHT_PERCENTAGE = 0.82

export interface CameraViewableArea {
  width: number
  height: number
  x: number
  y: number
  aspectRatio: number
  blackBars: {
    top: number
    bottom: number
    total: number
    topPercentage: number
    bottomPercentage: number
    totalPercentage: number
  }
}

/**
 * Hook that calculates the actual viewable camera area
 * 
 * This is critical for:
 * - Template overlays that need to match the camera viewfinder
 * - Preview cards that should show accurate camera proportions
 * - Any UI elements that need to align with the camera's viewable area
 * 
 * The calculation accounts for:
 * - Camera's resizeMode="contain" behavior
 * - Black bars created by aspect ratio mismatch
 * - Exact pixel coordinates for positioning
 */
export function useCameraViewfinder(): CameraViewableArea {
  return useMemo(() => {
    // Calculate viewable dimensions
    const viewfinderWidth = SCREEN_WIDTH
    const viewfinderHeight = SCREEN_HEIGHT * VIEWFINDER_HEIGHT_PERCENTAGE
    
    // Calculate positioning (centered vertically)
    const viewfinderX = 0
    const viewfinderY = (SCREEN_HEIGHT - viewfinderHeight) / 2
    
    // Calculate black bar areas
    const topBlackBar = viewfinderY
    const bottomBlackBar = SCREEN_HEIGHT - viewfinderY - viewfinderHeight
    const totalBlackBars = topBlackBar + bottomBlackBar
    
    // Calculate percentages for reference
    const topPercentage = (topBlackBar / SCREEN_HEIGHT) * 100
    const bottomPercentage = (bottomBlackBar / SCREEN_HEIGHT) * 100
    const totalPercentage = (totalBlackBars / SCREEN_HEIGHT) * 100
    
    return {
      width: viewfinderWidth,
      height: viewfinderHeight,
      x: viewfinderX,
      y: viewfinderY,
      aspectRatio: viewfinderWidth / viewfinderHeight,
      blackBars: {
        top: topBlackBar,
        bottom: bottomBlackBar,
        total: totalBlackBars,
        topPercentage,
        bottomPercentage,
        totalPercentage,
      }
    }
  }, []) // Empty dependency array since screen dimensions don't change
}

/**
 * Utility function to get viewfinder dimensions without hook
 * Useful for non-React contexts or one-time calculations
 */
export function getCameraViewfinderDimensions(): CameraViewableArea {
  const viewfinderWidth = SCREEN_WIDTH
  const viewfinderHeight = SCREEN_HEIGHT * VIEWFINDER_HEIGHT_PERCENTAGE
  const viewfinderX = 0
  const viewfinderY = (SCREEN_HEIGHT - viewfinderHeight) / 2
  
  const topBlackBar = viewfinderY
  const bottomBlackBar = SCREEN_HEIGHT - viewfinderY - viewfinderHeight
  const totalBlackBars = topBlackBar + bottomBlackBar
  
  return {
    width: viewfinderWidth,
    height: viewfinderHeight,
    x: viewfinderX,
    y: viewfinderY,
    aspectRatio: viewfinderWidth / viewfinderHeight,
    blackBars: {
      top: topBlackBar,
      bottom: bottomBlackBar,
      total: totalBlackBars,
      topPercentage: (topBlackBar / SCREEN_HEIGHT) * 100,
      bottomPercentage: (bottomBlackBar / SCREEN_HEIGHT) * 100,
      totalPercentage: (totalBlackBars / SCREEN_HEIGHT) * 100,
    }
  }
}

/**
 * Debug function to log viewfinder dimensions
 * Useful for development and debugging
 */
export function logCameraViewfinder(): void {
  const viewfinder = getCameraViewfinderDimensions()
  console.log('Camera Viewfinder Dimensions:', {
    screen: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    viewfinder: {
      width: viewfinder.width,
      height: viewfinder.height,
      x: viewfinder.x,
      y: viewfinder.y,
      aspectRatio: viewfinder.aspectRatio,
    },
    blackBars: viewfinder.blackBars,
    summary: {
      viewableArea: `${viewfinder.width}×${Math.round(viewfinder.height)}px`,
      blackBarsTotal: `${Math.round(viewfinder.blackBars.total)}px (${viewfinder.blackBars.totalPercentage.toFixed(1)}%)`,
      viewablePercentage: `${(100 - viewfinder.blackBars.totalPercentage).toFixed(1)}%`
    }
  })
}
