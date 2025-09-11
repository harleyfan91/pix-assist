import { useCallback, useState, useRef } from "react"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useSharedValue, runOnJS, withSpring } from "react-native-reanimated"
import { Camera } from "react-native-vision-camera"
import { PopupState } from "./useCameraControls"

export interface UseCameraGesturesProps {
  device: any // Camera device from react-native-vision-camera
  zoom: any // Shared value for zoom
  zoomOffset: any // Shared value for zoom offset
  popupVisible: any // Shared value for popup visibility
  setPopupState: (state: PopupState | ((prev: PopupState) => PopupState)) => void
  triggerHaptic: (type: 'impact' | 'selection', style: 'light' | 'medium' | 'heavy') => void
  takePhoto: () => void
  setShutterPressed: (pressed: boolean) => void
  recoverFromCameraError: () => void
  resetExposure: () => void // Function to reset exposure to neutral
}

export const useCameraGestures = ({
  device,
  zoom,
  zoomOffset,
  popupVisible,
  setPopupState,
  triggerHaptic,
  takePhoto,
  setShutterPressed,
  recoverFromCameraError,
  resetExposure
}: UseCameraGesturesProps) => {
  // Focus ring state
  const [showFocusRing, setShowFocusRing] = useState(false)
  const focusRingOpacity = useSharedValue(0)
  const focusRingPosition = useSharedValue({ x: 0, y: 0 })

  // Camera ref
  const _cameraRef = useRef<Camera>(null)
  
  // Callback ref to get camera instance
  const setCameraRef = useCallback((camera: Camera | null) => {
    _cameraRef.current = camera
  }, [])

  // Handle tap-to-focus (without locking)
  const handleFocusTap = useCallback(
    async (x: number, y: number) => {
      if (!device || !_cameraRef.current || !device.supportsFocus) return

      try {
        // Reset exposure to neutral when focusing
        resetExposure()

        // Use Vision Camera's focus method with screen coordinates directly
        // The focus function expects coordinates relative to the Camera view (in points)
        await _cameraRef.current.focus({ x, y })

        // Show focus ring animation
        focusRingPosition.value = { x, y }
        focusRingOpacity.value = 1
        setShowFocusRing(true)

        // Hide focus ring after 2 seconds
        setTimeout(() => {
          focusRingOpacity.value = 0
          setShowFocusRing(false)
        }, 2000)
      } catch (error) {
        console.error("Focus error:", error)
      }
    },
    [device, focusRingPosition, focusRingOpacity, resetExposure],
  )

  // Helper functions for popup management
  const onZoomStart = useCallback(() => {
    // Clear flash timeout if zoom becomes active
    setPopupState((prev: PopupState) => {
      if (prev.flashTimeout) {
        clearTimeout(prev.flashTimeout)
      }
      
      // Get current zoom level for initial display
      const currentZoom = zoom.value
      let logicalZoom: number
      
      if (device) {
        if (currentZoom <= device.minZoom) {
          logicalZoom = 0.5 // Ultra-wide
        } else if (currentZoom >= device.neutralZoom) {
          const scale = (currentZoom - device.neutralZoom) / (16 - device.neutralZoom)
          logicalZoom = 1 + scale * 15 // 1x to 16x
        } else {
          const scale = (currentZoom - device.minZoom) / (device.neutralZoom - device.minZoom)
          logicalZoom = 0.5 + scale * 0.5 // 0.5x to 1x
        }
      } else {
        logicalZoom = currentZoom
      }
      
      // Zoom becomes the active interaction
      const newState = {
        ...prev,
        type: 'zoom' as const,
        value: `${logicalZoom.toFixed(1)}x`,
        visible: true,
        activeInteraction: 'zoom' as const,
        flashTimeout: null
      }
      
      console.log('Zoom start - popup state:', newState)
      popupVisible.value = withSpring(1, { damping: 15, stiffness: 200 })
      console.log('Setting popupVisible to 1')
      return newState
    })
  }, [device, zoom, popupVisible, setPopupState])

  const handleZoomUpdate = useCallback((zoomLevel: number) => {
    // Only update if zoom is the active interaction OR no interaction is active
    setPopupState((prev: PopupState) => {
      if (prev.activeInteraction === 'zoom' || prev.activeInteraction === null) {
        const newState = {
          ...prev,
          type: 'zoom' as const,
          value: `${zoomLevel.toFixed(1)}x`,
          visible: true,
          activeInteraction: 'zoom' as const
        }
        console.log('Zoom update - popup state:', newState)
        return newState
      }
      console.log('Zoom update - ignoring, activeInteraction:', prev.activeInteraction)
      return prev
    })
  }, [setPopupState])

  const onZoomEnd = useCallback(() => {
    // Clear zoom after a longer delay, but only if zoom is still active
    setTimeout(() => {
      setPopupState((current: PopupState) => {
        if (current.activeInteraction === 'zoom') {
          popupVisible.value = withSpring(0, { damping: 15, stiffness: 200 })
          return {
            ...current,
            visible: false,
            type: null,
            activeInteraction: null
          }
        }
        return current
      })
    }, 2000) // Longer delay before hiding zoom (2 seconds)
  }, [popupVisible, setPopupState])

  // Create high-priority button gestures that will compete with camera gestures
  const shutterButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setShutterPressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(triggerHaptic)('impact', 'medium')
      runOnJS(takePhoto)()
      runOnJS(setShutterPressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setShutterPressed)(false)
    })

  // Create tap gesture for focus with lower priority than buttons
  const tapGesture = Gesture.LongPress()
    .minDuration(150) // 150ms minimum duration for long press
    .onStart(({ x, y }) => {
      'worklet'
      // Only handle focus tap if not in control areas
      // Bottom controls are typically in the bottom 120px of the screen
      const bottomControlsHeight = 120
      const isInBottomControls = y > (800 - bottomControlsHeight) // Approximate screen height
      
      // Check if tap is in exposure controls area (right side, 60px wide, 200px high, positioned at bottom: 300)
      const exposureControlsRight = 40
      const exposureControlsWidth = 60
      const exposureControlsHeight = 200
      const exposureControlsBottom = 300
      const exposureControlsTop = exposureControlsBottom - exposureControlsHeight
      const isInExposureControls = x >= exposureControlsRight && 
                                  x <= (exposureControlsRight + exposureControlsWidth) &&
                                  y >= exposureControlsTop && 
                                  y <= exposureControlsBottom
      
      if (!isInBottomControls && !isInExposureControls) {
        runOnJS(triggerHaptic)('impact', 'light')
        runOnJS(handleFocusTap)(x, y)
      }
    })
    .shouldCancelWhenOutside(true)

  // Create pinch gesture following Vision Camera example with snap-to-neutral
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet'
      zoomOffset.value = zoom.value
      runOnJS(onZoomStart)()
    })
    .onUpdate((event) => {
      'worklet'
      if (!device) return

      try {
        // Use a more direct approach for zoom calculation
        const baseZoom = zoomOffset.value
        const scaleFactor = event.scale
        const newZoom = baseZoom * scaleFactor

        // Clamp to reasonable limits (following best practices)
        const maxReasonableZoom = Math.min(device.maxZoom, 10) // Cap at 10x as requested
        const clampedZoom = Math.max(device.minZoom, Math.min(newZoom, maxReasonableZoom))
        
        // Only update zoom if the change is significant to prevent excessive updates
        if (Math.abs(clampedZoom - zoom.value) > 0.01) {
          zoom.value = clampedZoom
          
          // Convert actual zoom to logical zoom scale for display
          let logicalZoom: number
          if (clampedZoom <= device.minZoom) {
            logicalZoom = 0.5 // Ultra-wide
          } else if (clampedZoom >= device.neutralZoom) {
            // Scale from neutralZoom to max: 2.0 -> 16.0 maps to 1.0 -> 16.0
            const scale = (clampedZoom - device.neutralZoom) / (16 - device.neutralZoom)
            logicalZoom = 1 + scale * 15 // 1x to 16x
          } else {
            // Scale from minZoom to neutralZoom: 1.0 -> 2.0 maps to 0.5 -> 1.0
            const scale = (clampedZoom - device.minZoom) / (device.neutralZoom - device.minZoom)
            logicalZoom = 0.5 + scale * 0.5 // 0.5x to 1x
          }
          
          runOnJS(handleZoomUpdate)(logicalZoom)
        }
      } catch (error) {
        console.log('Zoom update error:', error)
        // Don't update zoom on error to prevent further issues
      }
    })
    .onEnd(() => {
      'worklet'
      if (!device) return
      
      try {
        const neutralZoom = device.neutralZoom
        const currentZoomValue = zoom.value
        
        // Define snap threshold - if within 0.5x of neutral, snap to neutral
        const snapThreshold = 0.5
        const distanceFromNeutral = Math.abs(currentZoomValue - neutralZoom)
        
        if (distanceFromNeutral <= snapThreshold) {
          // Snap to neutral zoom with smooth spring animation
          runOnJS(triggerHaptic)('impact', 'light') // Light haptic feedback for zoom snap
          zoom.value = withSpring(neutralZoom, {
            damping: 18,
            stiffness: 250,
            mass: 0.7,
          })
        }
        
        runOnJS(onZoomEnd)()
      } catch (error) {
        console.log('Zoom end error:', error)
        // Trigger camera recovery on zoom error
        runOnJS(recoverFromCameraError)()
      }
    })

  // Camera gestures (focus tap and zoom)
  const cameraGestures = Gesture.Simultaneous(tapGesture, pinchGesture)

  return {
    // Focus ring state
    showFocusRing,
    focusRingOpacity,
    focusRingPosition,
    
    // Camera ref
    _cameraRef,
    setCameraRef,
    
    // Gestures
    shutterButtonGesture,
    cameraGestures,
    
    // Focus functionality
    handleFocusTap,
  }
}
