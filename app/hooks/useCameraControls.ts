import { useCallback, useEffect, useState, useRef } from "react"
import { useSharedValue, withSpring, runOnJS } from "react-native-reanimated"
import * as Haptics from 'expo-haptics'
import { Camera } from "react-native-vision-camera"

export type FlashMode = 'auto' | 'on' | 'off'

export interface PopupState {
  type: 'zoom' | 'flash' | null
  value: string
  visible: boolean
  activeInteraction: 'zoom' | 'flash' | null
  flashTimeout: NodeJS.Timeout | null
}

export interface UseCameraControlsProps {
  device: any // Camera device from react-native-vision-camera
  zoom: any // Shared value for zoom
  popupVisible: any // Shared value for popup visibility
  setPopupState: (state: PopupState | ((prev: PopupState) => PopupState)) => void
}

export const useCameraControls = ({
  device,
  zoom,
  popupVisible,
  setPopupState
}: UseCameraControlsProps) => {
  // Flash mode state
  const [flashMode, setFlashMode] = useState<FlashMode>('auto')
  const flashModeRef = useRef<FlashMode>('auto')
  
  // Camera mode button expansion state
  const [isCameraModeExpanded, setIsCameraModeExpanded] = useState(false)
  const cameraModeExpansion = useSharedValue(0) // 0 = collapsed, 1 = expanded
  
  // Exposure controls state
  const [showExposureControls, setShowExposureControls] = useState(false)
  const [isExposureControlsVisible, setIsExposureControlsVisible] = useState(false)
  const [sliderValue, setSliderValue] = useState(0) // -1 to 1 range for Gluestack Slider
  const exposureSlider = useSharedValue(0) // -1 to 1 range
  const exposureControlsAnimation = useSharedValue(0) // 0 = closed, 1 = open
  
  // Photo capture state
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureFlash, setCaptureFlash] = useState(false)
  const flashAnimation = useSharedValue(0) // 0 = no flash, 1 = flash
  
  // Button press states for visual feedback
  const [shutterPressed, setShutterPressed] = useState(false)

  // Safe haptic feedback function
  const triggerHaptic = useCallback(async (type: 'impact' | 'selection' = 'impact', style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      if (type === 'impact') {
        const impactStyle = style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
                           style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
                           Haptics.ImpactFeedbackStyle.Medium
        await Haptics.impactAsync(impactStyle)
      } else if (type === 'selection') {
        await Haptics.selectionAsync()
      }
    } catch (error) {
      console.log('Haptic not available:', error)
    }
  }, [])

  // Flash button functionality with popup integration
  const handleFlashToggle = useCallback(() => {
    // Clear any existing flash timeout
    setPopupState(prev => {
      if (prev.flashTimeout) {
        clearTimeout(prev.flashTimeout)
      }
      return prev
    })
    
    setFlashMode(prevMode => {
      const newMode = (() => {
        switch (prevMode) {
          case 'auto':
            return 'on'
          case 'on':
            return 'off'
          case 'off':
            return 'auto'
          default:
            return 'auto'
        }
      })()
      
      console.log('Flash mode changed:', prevMode, '→', newMode)
      // Update ref immediately to avoid race conditions
      flashModeRef.current = newMode
      
      // Flash becomes the active interaction
      const flashText = newMode === 'auto' ? 'Auto' : newMode === 'on' ? 'On' : 'Off'
      const flashTimeout = setTimeout(() => {
        setPopupState(current => ({
          ...current,
          visible: false,
          type: null,
          activeInteraction: null,
          flashTimeout: null
        }))
        popupVisible.value = withSpring(0, { damping: 20, stiffness: 300 })
      }, 2000)
      
      setPopupState(prev => ({
        ...prev,
        type: 'flash',
        value: flashText,
        visible: true,
        activeInteraction: 'flash',
        flashTimeout
      }))
      
      popupVisible.value = withSpring(1, { damping: 15, stiffness: 200 })
      
      return newMode
    })
  }, [popupVisible, setPopupState])

  // Toggle exposure controls
  const toggleExposureControls = useCallback(() => {
    // Only allow exposure controls to open if mode menu is expanded
    if (!isCameraModeExpanded && !showExposureControls) {
      console.log("Cannot open exposure controls - mode menu must be expanded first")
      return
    }
    
    setShowExposureControls(prev => !prev)
  }, [isCameraModeExpanded, showExposureControls])

  // Toggle camera mode expansion
  const toggleCameraModeExpansion = useCallback(() => {
    console.log("Toggling camera mode expansion")
    setIsCameraModeExpanded(prev => {
      const newState = !prev
      console.log("Previous state:", prev, "New state:", newState)
      
      // If closing the mode menu, also close the exposure controls
      if (!newState && showExposureControls) {
        setShowExposureControls(false)
        console.log("Closing exposure controls because mode menu is closing")
      }
      
      return newState
    })
  }, [showExposureControls])

  // Close all controls (for tap away functionality)
  const closeAllControls = useCallback(() => {
    console.log("Closing all controls")
    if (isCameraModeExpanded) {
      setIsCameraModeExpanded(false)
    }
    if (showExposureControls) {
      setShowExposureControls(false)
    }
  }, [isCameraModeExpanded, showExposureControls])

  // Handle exposure slider change with neutral position snapping
  const handleExposureSliderChange = useCallback((value: number) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    
    // Validate the value to prevent NaN
    if (isNaN(numValue) || !isFinite(numValue)) {
      return
    }
    
    // Clamp the value to valid range
    const clampedValue = Math.max(-1, Math.min(1, numValue))
    
    // Neutral position snapping logic
    const neutralPosition = 0
    const snapThreshold = 0.2 // Snap to neutral if within 0.2 of center
    
    // Check if value is close to neutral position for snapping
    if (Math.abs(clampedValue - neutralPosition) <= snapThreshold) {
      setSliderValue(neutralPosition)
      exposureSlider.value = neutralPosition
    } else {
      setSliderValue(clampedValue)
      exposureSlider.value = clampedValue
    }
  }, [exposureSlider])

  // Reset exposure to neutral position
  const resetExposure = useCallback(() => {
    setSliderValue(0)
    exposureSlider.value = 0
  }, [exposureSlider])

  // Update flash mode ref when flash mode changes
  useEffect(() => {
    flashModeRef.current = flashMode // Keep ref in sync
  }, [flashMode])

  // Animate camera mode button expansion
  useEffect(() => {
    cameraModeExpansion.value = withSpring(isCameraModeExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    })
  }, [isCameraModeExpanded, cameraModeExpansion])

  // Handle exposure controls visibility and animation
  useEffect(() => {
    if (showExposureControls) {
      // Opening: show component and animate in
      setIsExposureControlsVisible(true)
      exposureControlsAnimation.value = withSpring(1, { 
        damping: 20, 
        stiffness: 300 
      })
    } else {
      // Closing: animate out first, then hide component
      exposureControlsAnimation.value = withSpring(0, { 
        damping: 20, 
        stiffness: 300 
      }, (finished) => {
        if (finished) {
          // Animation completed, now hide the component
          runOnJS(setIsExposureControlsVisible)(false)
        }
      })
    }
  }, [showExposureControls, exposureControlsAnimation])

  return {
    // Flash controls
    flashMode,
    flashModeRef,
    handleFlashToggle,
    flashAnimation,
    captureFlash,
    setCaptureFlash,
    
    // Camera mode expansion
    isCameraModeExpanded,
    cameraModeExpansion,
    toggleCameraModeExpansion,
    
    // Exposure controls
    showExposureControls,
    isExposureControlsVisible,
    exposureControlsAnimation,
    exposureSlider,
    sliderValue,
    toggleExposureControls,
    handleExposureSliderChange,
    resetExposure,
    
    // Photo capture
    isCapturing,
    setIsCapturing,
    
    // Button states
    shutterPressed,
    setShutterPressed,
    
    // Utilities
    triggerHaptic,
    closeAllControls,
  }
}
