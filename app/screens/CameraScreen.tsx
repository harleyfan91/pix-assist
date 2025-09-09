import { FC, useCallback, useEffect, useState, useRef } from "react"
import {
  Alert,
  Linking,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleSheet,
  Modal,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button, ButtonText, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@gluestack-ui/themed"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  runOnJS,
  interpolate,
  withTiming,
  withSpring,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import * as Haptics from 'expo-haptics'

// Create Reanimated Camera component for animated exposure
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TopNavigation } from "@/components/TopNavigation"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators/AppNavigator"
import { photoLibraryService } from "@/services/photoLibrary"
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation"

// Enable zoom animation for Reanimated (as per Vision Camera docs)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
  exposure: true,
})

export const CameraScreen: FC = function CameraScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState(true) // Camera active state
  const [cameraError, setCameraError] = useState<string | null>(null)
  const navigation = useNavigation<AppStackScreenProps<"Camera">["navigation"]>()
  
  // Device orientation detection for UI adjustments (screen is locked to portrait)
  const deviceOrientation = useDeviceOrientation()

  // Get icon rotation angle based on device orientation
  const getIconRotation = () => {
    switch (deviceOrientation.orientation) {
      case 'landscape-left':
        return '90deg'  // Rotate 90° clockwise
      case 'landscape-right':
        return '-90deg' // Rotate 90° counter-clockwise
      case 'portrait-upside-down':
        return '180deg' // Rotate 180°
      case 'portrait':
      default:
        return '0deg'   // No rotation
    }
  }

  // Debug device orientation changes (for UI adjustments only) - only log when orientation actually changes
  useEffect(() => {
    // Only log when orientation changes, not on every render
    console.log('CameraScreen device orientation changed:', deviceOrientation.orientation)
  }, [deviceOrientation.orientation])

  // Note: Screen orientation is locked at app level to prevent rotation

  const { hasPermission, requestPermission } = useCameraPermission()
  // Use camera device with ultra-wide support for zoom out below 1x
  const device = useCameraDevice("back", {
    physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera", "telephoto-camera"],
  })
  
  // Debug device zoom info
  useEffect(() => {
    if (device) {
      console.log('📱 Camera Device Info:', {
        minZoom: device.minZoom,
        maxZoom: device.maxZoom,
        neutralZoom: device.neutralZoom,
        physicalDevices: device.physicalDevices,
        hasFlash: device.hasFlash,
        hasTorch: device.hasTorch
      })
    }
  }, [device])
  
  // Simple zoom debug function
  const logZoomInfo = useCallback((message: string, currentZoom: number) => {
    if (device) {
      console.log(`🔍 ${message}:`, {
        current: currentZoom.toFixed(2),
        neutral: device.neutralZoom.toFixed(2),
        distance: Math.abs(currentZoom - device.neutralZoom).toFixed(2)
      })
    }
  }, [device])
  
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

  const _cameraRef = useRef<Camera>(null)
  
  // Callback ref to get camera instance
  const setCameraRef = useCallback((camera: Camera | null) => {
    _cameraRef.current = camera
  }, [])

  // Initialize zoom with device's neutral zoom (as per Vision Camera docs)
  const zoom = useSharedValue(device?.neutralZoom ?? 1)
  const zoomOffset = useSharedValue(0)
  const [currentZoom, setCurrentZoom] = useState(device?.neutralZoom ?? 1)

  // Camera error recovery function
  const recoverFromCameraError = useCallback(() => {
    console.log("Attempting camera recovery from zoom error...")
    setCameraError("Camera temporarily unavailable")
    setIsActive(false)
    
    setTimeout(() => {
      console.log("Resuming camera after recovery...")
      setIsActive(true)
      setCameraError(null)
      // Reset zoom to neutral to prevent further errors
      if (device) {
        zoom.value = device.neutralZoom
      }
    }, 2000)
  }, [device, zoom])

  // Flash button functionality
  const handleFlashToggle = useCallback(() => {
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
      
      // Show flash mode in popup
      const flashText = newMode === 'auto' ? 'Auto' : newMode === 'on' ? 'On' : 'Off'
      setPopupTextOverride(flashText)
      setTimeout(() => setPopupTextOverride(null), 1500)
      
      return newMode
    })
  }, [])

  // Focus and exposure state
  const [isFocusLocked, setIsFocusLocked] = useState(false)
  const [showFocusRing, setShowFocusRing] = useState(false)
  const focusRingOpacity = useSharedValue(0)
  const focusRingPosition = useSharedValue({ x: 0, y: 0 })
  
  // Exposure state
  const exposureSlider = useSharedValue(0) // -1 to 1 range
  const [showExposureControls, setShowExposureControls] = useState(false)
  const [isExposureControlsVisible, setIsExposureControlsVisible] = useState(false) // Controls actual rendering
  const [sliderValue, setSliderValue] = useState(0) // -1 to 1 range for Gluestack Slider
  const exposureControlsAnimation = useSharedValue(0) // 0 = closed, 1 = open

  // Navigation state for camera animation
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [navigationProgress, setNavigationProgress] = useState(0) // 0-1 progress
  const cameraOffset = useSharedValue(0) // Camera push-up offset

  // Camera mode button expansion state and animation
  const [isCameraModeExpanded, setIsCameraModeExpanded] = useState(false)
  const cameraModeExpansion = useSharedValue(0) // 0 = collapsed, 1 = expanded

  // Photo capture state
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureFlash, setCaptureFlash] = useState(false)
  const flashAnimation = useSharedValue(0) // 0 = no flash, 1 = flash

  // Flash mode state: 'auto' | 'on' | 'off'
  const [flashMode, setFlashMode] = useState<'auto' | 'on' | 'off'>('auto')
  const flashModeRef = useRef<'auto' | 'on' | 'off'>('auto')
  
  // Temporary popup text override (for flash feedback)
  const [popupTextOverride, setPopupTextOverride] = useState<string | null>(null)

  // Debug flash mode changes and update ref
  useEffect(() => {
    console.log('Flash mode updated to:', flashMode)
    flashModeRef.current = flashMode // Keep ref in sync
    console.log('Device flash capabilities:', {
      hasFlash: device?.hasFlash,
      hasTorch: device?.hasTorch
    })
  }, [flashMode, device])

  // Preview state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false) // Controls actual rendering
  const previewAnimation = useSharedValue(0) // 0 = hidden, 1 = visible

  useEffect(() => {
    setCameraPermission(hasPermission)
  }, [hasPermission])

  // Animate camera offset based on navigation progress
  useEffect(() => {
    const targetOffset = navigationProgress * 80 // 0-80px based on progress
    cameraOffset.value = withTiming(targetOffset, {
      duration: 100, // Very fast for real-time tracking
    })
  }, [navigationProgress, cameraOffset])

  // Animate camera mode button expansion
  useEffect(() => {
    console.log("Animation effect triggered, isCameraModeExpanded:", isCameraModeExpanded)
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

  // Handle preview visibility and animation
  useEffect(() => {
    if (showPreview && capturedPhoto) {
      // Opening: show component and animate in
      setIsPreviewVisible(true)
      previewAnimation.value = withSpring(1, { 
        damping: 20, 
        stiffness: 300 
      })
    } else {
      // Closing: animate out first, then hide component
      previewAnimation.value = withSpring(0, { 
        damping: 20, 
        stiffness: 300 
      }, (finished) => {
        if (finished) {
          // Animation completed, now hide the component
          runOnJS(setIsPreviewVisible)(false)
          runOnJS(setCapturedPhoto)(null)
        }
      })
    }
  }, [showPreview, capturedPhoto, previewAnimation])

  // Initialize zoom with device's neutral zoom when device changes
  useEffect(() => {
    if (device) {
      console.log("Camera device info:", {
        minZoom: device.minZoom,
        maxZoom: device.maxZoom,
        neutralZoom: device.neutralZoom,
        physicalDevices: device.physicalDevices,
        hasUltraWide: device.physicalDevices?.includes("ultra-wide-angle-camera"),
      })
      zoom.value = device.neutralZoom ?? 1
      runOnJS(setCurrentZoom)(device.neutralZoom ?? 1)
    }
  }, [device, zoom])

  // Update zoom text periodically (following best practices)
  useEffect(() => {
    const interval = setInterval(() => {
      // Convert actual zoom to logical zoom scale for display
      const actualZoom = zoom.value
      let logicalZoom: number

      if (device) {
        // Map actual zoom to logical zoom scale
        // neutralZoom (2.0) = 1x, minZoom (1.0) = 0.5x, max = 16x
        if (actualZoom <= device.minZoom) {
          logicalZoom = 0.5 // Ultra-wide
        } else if (actualZoom >= device.neutralZoom) {
          // Scale from neutralZoom to max: 2.0 -> 16.0 maps to 1.0 -> 16.0
          const scale = (actualZoom - device.neutralZoom) / (16 - device.neutralZoom)
          logicalZoom = 1 + scale * 15 // 1x to 16x
        } else {
          // Scale from minZoom to neutralZoom: 1.0 -> 2.0 maps to 0.5 -> 1.0
          const scale = (actualZoom - device.minZoom) / (device.neutralZoom - device.minZoom)
          logicalZoom = 0.5 + scale * 0.5 // 0.5x to 1x
        }
      } else {
        logicalZoom = actualZoom
      }

      runOnJS(setCurrentZoom)(logicalZoom)
    }, 100) // Update every 100ms for smooth display

    return () => clearInterval(interval)
  }, [zoom, device])

  const promptForCameraPermissions = useCallback(async () => {
    if (hasPermission) return
    const permission = await requestPermission()
    setCameraPermission(permission)

    if (!permission) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to take photos. Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      )
    }
  }, [hasPermission, requestPermission])

  const takePhoto = useCallback(async () => {
    if (!_cameraRef.current || isCapturing) {
      console.log("Camera not ready or already capturing")
      return
    }

    try {
      setIsCapturing(true)
      console.log("Taking photo...")

      // Trigger flash animation - fast and responsive (only if flash is on)
      if (flashMode === 'on') {
        setCaptureFlash(true)
        flashAnimation.value = withTiming(1, { duration: 50 }, () => {
          flashAnimation.value = withTiming(0, { duration: 100 })
        })
      } else if (flashMode === 'auto') {
        // For auto mode, show a brief flash animation to indicate flash might fire
        setCaptureFlash(true)
        flashAnimation.value = withTiming(0.3, { duration: 30 }, () => {
          flashAnimation.value = withTiming(0, { duration: 50 })
        })
      }

      // Use ref to get the most current flash mode to avoid race conditions
      const currentFlashMode = flashModeRef.current
      console.log('Taking photo with flash mode:', currentFlashMode)
      
      // Set flash mode for photo capture
      console.log('Photo options being set:', { flash: currentFlashMode })
      
      // Try different approaches based on flash mode
      let photoOptions: any = {}
      
      if (currentFlashMode === 'on') {
        // For 'on' mode, be more explicit
        photoOptions = { 
          flash: 'on',
          enableAutoStabilization: false // Sometimes helps with flash issues
        }
      } else if (currentFlashMode === 'off') {
        photoOptions = { flash: 'off' }
      } else {
        // Auto mode
        photoOptions = { flash: 'auto' }
      }
      
      console.log('Final photo options:', photoOptions)
      const photoPromise = _cameraRef.current.takePhoto(photoOptions)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Photo capture timeout')), 5000)
      )
      
      const photo = await Promise.race([photoPromise, timeoutPromise])

      console.log("Photo captured:", photo.path)
      console.log("Photo object:", photo)

      // Navigate to preview screen (don't save yet - let user decide)
      const photoPath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`
      console.log("Photo captured, navigating to preview screen")
      
      // Navigate to PreviewScreen
      navigation.navigate('Preview', { photoPath })

    } catch (error) {
      console.error("Error taking photo:", error)
      
      // Handle specific AVFoundation errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('AVFoundationErrorDomain') || 
          errorMessage.includes('Cannot Complete Action')) {
        console.log("AVFoundation error detected - attempting camera recovery")
        setCameraError("Camera temporarily unavailable")
        
        // Try to recover by briefly pausing and resuming camera
        setIsActive(false)
        setTimeout(() => {
          console.log("Attempting camera recovery...")
          setIsActive(true)
          setCameraError(null)
        }, 2000)
      }
      
      // Show user-friendly error message
      Alert.alert(
        "Camera Error",
        "Unable to take photo. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      setIsCapturing(false)
      setCaptureFlash(false)
      // Ensure flash animation is reset
      flashAnimation.value = 0
    }
  }, [isCapturing, flashAnimation])

  const navigateToGallery = useCallback(() => {
    navigation.navigate("Gallery")
  }, [navigation])

  const toggleExposureControls = useCallback(() => {
    setShowExposureControls(prev => !prev)
  }, [])

  const toggleCameraModeExpansion = useCallback(() => {
    console.log("Toggling camera mode expansion")
    setIsCameraModeExpanded(prev => {
      console.log("Previous state:", prev, "New state:", !prev)
      return !prev
    })
  }, [])

  // Button press states for visual feedback
  const [shutterPressed, setShutterPressed] = useState(false)
  const [flashPressed, setFlashPressed] = useState(false)
  const [evPressed, setEvPressed] = useState(false)
  const [galleryPressed, setGalleryPressed] = useState(false)
  const [cameraModePressed, setCameraModePressed] = useState(false)

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

  const flashButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setFlashPressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(handleFlashToggle)()
      runOnJS(setFlashPressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setFlashPressed)(false)
    })

  const evButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setEvPressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(toggleExposureControls)()
      runOnJS(setEvPressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setEvPressed)(false)
    })

  const galleryButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setGalleryPressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(navigateToGallery)()
      runOnJS(setGalleryPressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setGalleryPressed)(false)
    })

  const cameraModeButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setCameraModePressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(toggleCameraModeExpansion)()
      runOnJS(setCameraModePressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setCameraModePressed)(false)
    })


  // Handle tap-to-focus
  const handleFocusTap = useCallback(
    async (x: number, y: number) => {
      if (!device || !_cameraRef.current || !device.supportsFocus) return

      try {
        console.log("Setting focus at screen:", { x, y })

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

        // Reset focus lock
        setIsFocusLocked(false)
      } catch (error) {
        console.error("Focus error:", error)
      }
    },
    [device, focusRingPosition, focusRingOpacity],
  )

  // Handle AE/AF lock (long press)
  const handleFocusLock = useCallback(
    (x: number, y: number) => {
      console.log("Locking focus and exposure")
      setIsFocusLocked(true)
      handleFocusTap(x, y)
    },
    [handleFocusTap],
  )

  // Create tap gesture for focus with lower priority than buttons
  const tapGesture = Gesture.Tap()
    .onEnd(({ x, y }) => {
      'worklet'
      // Only handle focus tap if not in bottom controls area
      // Bottom controls are typically in the bottom 120px of the screen
      const bottomControlsHeight = 120
      const isInBottomControls = y > (800 - bottomControlsHeight) // Approximate screen height
      
      if (!isInBottomControls) {
        runOnJS(handleFocusTap)(x, y)
      }
    })
    .shouldCancelWhenOutside(true)

  // Create long press gesture for AE/AF lock
  const longPressGesture = Gesture.LongPress()
    .minDuration(500) // 500ms for long press
    .onStart(({ x, y }) => {
      'worklet'
      runOnJS(handleFocusLock)(x, y)
    })

  // Create pinch gesture following Vision Camera example with snap-to-neutral
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet'
      zoomOffset.value = zoom.value
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
        const currentZoom = zoom.value
        
        // Define snap threshold - if within 0.5x of neutral, snap to neutral
        const snapThreshold = 0.5
        const distanceFromNeutral = Math.abs(currentZoom - neutralZoom)
        
        if (distanceFromNeutral <= snapThreshold) {
          // Snap to neutral zoom with smooth spring animation
          runOnJS(logZoomInfo)('Snapping to neutral', currentZoom)
          runOnJS(triggerHaptic)('impact', 'light') // Light haptic feedback for zoom snap
          zoom.value = withSpring(neutralZoom, {
            damping: 18,
            stiffness: 250,
            mass: 0.7,
          })
        } else {
          runOnJS(logZoomInfo)('Staying at current zoom', currentZoom)
        }
      } catch (error) {
        console.log('Zoom end error:', error)
        // Trigger camera recovery on zoom error
        runOnJS(recoverFromCameraError)()
      }
    })



  // Combine camera gestures (focus and zoom) - these compete with button gestures
  const cameraGestures = Gesture.Simultaneous(tapGesture, longPressGesture, pinchGesture)

  // Update camera zoom when zoom value changes
  const [cameraZoom, setCameraZoom] = useState(device?.neutralZoom ?? 1)
  
  // Update camera zoom when zoom value changes using derived value
  useDerivedValue(() => {
    try {
      runOnJS(setCameraZoom)(zoom.value)
    } catch (error) {
      console.log('Camera zoom update error:', error)
      // Don't update camera zoom on error
    }
  })

  // Animated style for camera container push-up effect
  const animatedCameraContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cameraOffset.value }],
    }
  })

  // Map exposure slider to device exposure range (conservative range)
  const exposureValue = useDerivedValue(() => {
    if (!device) return 0
    // Map slider value (-1 to 1) to a conservative portion of device exposure range
    const range = device.maxExposure - device.minExposure
    const conservativeRange = range * 0.3 // Use only 30% of the full range
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

  // Create animated style for zoom indicator visibility
  const animatedZoomStyle = useAnimatedStyle(() => {
    const neutralZoom = device?.neutralZoom ?? 1
    const isZoomed = Math.abs(zoom.value - neutralZoom) > 0.1
    return {
      opacity: (isZoomed || popupTextOverride) ? 1 : 0,
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



  const { right: _right, top: _top } = useSafeAreaInsets()

  if (cameraPermission == null) {
    // still loading
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 TESTING RELOAD..." />
        </View>
      </Screen>
    )
  }

  if (!cameraPermission) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 Camera Permission Required" />
          <Text preset="subheading" text="Please grant camera permission to use this feature." />
          <Button onPress={promptForCameraPermissions} variant="solid" size="lg">
            <ButtonText>Request Camera Permission</ButtonText>
          </Button>
        </View>
      </Screen>
    )
  }

  if (!device) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 No Camera Found" />
          <Text preset="subheading" text="No camera device available on this device." />
        </View>
      </Screen>
    )
  }

  return (
    <View style={$container}>
      {/* Top Navigation - Fixed at top, independent of camera movement */}
      <TopNavigation 
        onNavigationStateChange={setIsNavigationOpen}
        onProgressChange={setNavigationProgress}
        isLandscape={deviceOrientation.isLandscape}
      />
      
      {/* Camera Content - Moves down when navigation opens */}
      <GestureDetector gesture={cameraGestures}>
        <Reanimated.View style={[$cameraContainer, animatedCameraContainerStyle]}>
          <View style={StyleSheet.absoluteFill}>
            <ReanimatedCamera
              {...({ ref: _cameraRef } as any)}
              isActive={isActive}
              device={device}
              style={StyleSheet.absoluteFill}
              photo
              video
              zoom={cameraZoom}
              enableZoomGesture={false} // We're using custom gesture
              enableExposure={true} // Enable exposure control
              flash={flashMode} // Set flash mode on camera component
              animatedProps={animatedCameraProps}
              onError={(error) => {
                console.error('Camera error:', error)
                if (error.message?.includes('AVFoundationErrorDomain') || 
                    error.message?.includes('Cannot Complete Action')) {
                  recoverFromCameraError()
                }
              }}
            />
            
            {/* Flash overlay for photo capture feedback */}
            <Reanimated.View style={[$flashOverlay, animatedFlashStyle]} />

            {/* Preview overlay - shows captured photo for 2 seconds */}
            {isPreviewVisible && capturedPhoto && (
              <TouchableOpacity 
                style={$previewOverlay}
                onPress={() => {
                  // Navigate to full preview screen
                  navigation.navigate("Preview", { photoPath: capturedPhoto })
                }}
                activeOpacity={0.9}
              >
                <Reanimated.View style={[$previewContainer, animatedPreviewStyle]}>
                  <Image 
                    source={{ uri: capturedPhoto }} 
                    style={$previewImage}
                    resizeMode="contain"
                  />
                </Reanimated.View>
              </TouchableOpacity>
            )}

            {/* Zoom Indicator - Only show when zoomed */}
            <Reanimated.View style={[$zoomIndicator, animatedZoomStyle]}>
              <Text style={$zoomText}>{popupTextOverride || `${currentZoom.toFixed(1)}x`}</Text>
            </Reanimated.View>

            {/* Orientation Debug Indicator */}
            <View style={$orientationIndicator}>
              <Text style={$orientationText}>
                {deviceOrientation.isLandscape ? '📱 Device: Landscape' : deviceOrientation.isPortrait ? '📱 Device: Portrait' : '📱 Device: Unknown'}
              </Text>
            </View>

            {/* Focus Ring - Only show when focusing */}
            {showFocusRing && <Reanimated.View style={[$focusRing, animatedFocusRingStyle]} />}

            {/* AE/AF Lock Indicator - Only show when locked */}
            {isFocusLocked && (
              <View style={$aeLockIndicator}>
                <Text style={$aeLockText}>AE/AF LOCK</Text>
              </View>
            )}


            {/* Exposure Controls - Gluestack Slider */}
            {isExposureControlsVisible && (
              <Reanimated.View style={[$exposureControlsVertical, animatedExposureControlsStyle]}>
                  <View style={$exposureSliderContainer}>
                    <Text style={$exposureLabel}>+2</Text>
                    <Slider
                      value={sliderValue}
                      onChange={(value: any) => {
                        console.log('Slider onChange:', value, typeof value)
                        const numValue = typeof value === 'number' ? value : parseFloat(value)
                        
                        // Validate the value to prevent NaN
                        if (isNaN(numValue) || !isFinite(numValue)) {
                          console.log('Invalid slider value, skipping update')
                          return
                        }
                        
                        // Clamp the value to valid range
                        const clampedValue = Math.max(-1, Math.min(1, numValue))
                        
                        setSliderValue(clampedValue)
                        exposureSlider.value = clampedValue
                      }}
                      minValue={-1}
                      maxValue={1}
                      step={0.01}
                      orientation="vertical"
                      style={$gluestackSlider}
                    >
                      <SliderTrack style={$sliderTrack}>
                        <SliderFilledTrack style={$sliderFilledTrack} />
                      </SliderTrack>
                      <SliderThumb style={$sliderThumb} />
                    </Slider>
                    <Text style={$exposureLabel}>-2</Text>
                  </View>
                </Reanimated.View>
            )}
          </View>

          {/* Unified click away overlay for menus (not preview) */}
          {(isCameraModeExpanded || showExposureControls) && !showPreview && (
            <TouchableOpacity 
              style={$unifiedOverlay}
              onPress={() => {
                // Close both menus when clicking away
                if (isCameraModeExpanded) setIsCameraModeExpanded(false)
                if (showExposureControls) setShowExposureControls(false)
              }}
              activeOpacity={1}
            />
          )}

          {/* Bottom Controls - iPhone-style layout */}
          <View style={$bottomControls}>
            {/* Left Container: Gallery Button */}
            <View style={$leftControlsContainer}>
              <GestureDetector gesture={galleryButtonGesture}>
                <View style={[
                  $galleryButton,
                  galleryPressed && { opacity: 0.6 }
                ]}>
                  <Ionicons 
                    name="images-outline" 
                    size={24} 
                    color="#fff" 
                    style={{ transform: [{ rotate: getIconRotation() }] }}
                  />
                </View>
              </GestureDetector>
            </View>

            {/* Center Container: Shutter Button */}
            <View style={$centerControlsContainer}>
              <GestureDetector gesture={shutterButtonGesture}>
                <View style={[
                  $shutterButton,
                  (shutterPressed || isCapturing) && { opacity: 0.6 }
                ]}>
                  <View style={$shutterButtonInner} />
                </View>
              </GestureDetector>
            </View>

            {/* Right Container: Camera Mode Button */}
            <View style={$rightControlsContainer}>
              <GestureDetector gesture={cameraModeButtonGesture}>
                <Reanimated.View style={[
                  $cameraModeButton,
                  animatedCameraModeStyle,
                  cameraModePressed && { opacity: 0.6 }
                ]}>
                  {/* Camera control buttons - only visible when expanded */}
                  <Reanimated.View style={[$controlsContainer, animatedCameraControlsOpacity]}>
                    <GestureDetector gesture={flashButtonGesture}>
                      <View style={[$controlButton, flashPressed && { opacity: 0.6 }]}>
                        <Ionicons 
                          name={
                            flashMode === 'auto' ? 'flash-outline' :
                            flashMode === 'on' ? 'flash' :
                            'flash-off-outline'
                          }
                          size={20} 
                          color="#fff" 
                          style={{ transform: [{ rotate: getIconRotation() }] }}
                        />
                      </View>
                    </GestureDetector>
                    <GestureDetector gesture={evButtonGesture}>
                      <View style={[$controlButton, evPressed && { opacity: 0.6 }]}>
                        <Ionicons 
                          name="contrast-outline" 
                          size={20} 
                          color="#fff" 
                          style={{ transform: [{ rotate: getIconRotation() }] }}
                        />
                      </View>
                    </GestureDetector>
                    <View style={$controlButton}>
                      <Ionicons 
                        name="crop-outline" 
                        size={20} 
                        color="#fff" 
                        style={{ transform: [{ rotate: getIconRotation() }] }}
                      />
                    </View>
                  </Reanimated.View>
                  
                {/* Main chevron icon - animated positioning */}
                <Reanimated.View style={[$chevronContainer, animatedChevronStyle]}>
                  <Ionicons name="chevron-up-sharp" size={24} color="#fff" />
                </Reanimated.View>
                </Reanimated.View>
              </GestureDetector>
            </View>
          </View>
        </Reanimated.View>
      </GestureDetector>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

const $cameraContainer: ViewStyle = {
  flex: 1,
}

const $bottomControls: ViewStyle = {
  position: "absolute",
  bottom: 80, // Back to comfortable position without drawer interference
  left: 0,
  right: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 40,
  zIndex: 100, // Ensure controls are above camera gestures
}

// Landscape-specific bottom controls (moved to right side)
const $bottomControlsLandscape: ViewStyle = {
  position: "absolute",
  right: 40,
  top: "50%",
  transform: [{ translateY: -120 }], // Center vertically
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  height: 240, // Space for all controls
  paddingVertical: 0,
}

const $leftControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 60, // Fixed width to match gallery button
}

const $centerControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  flex: 1, // Take up remaining space to center the shutter button
}

const $rightControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "flex-end", // Align button to bottom of container
  height: 80, // Fixed height to match button height
  width: 60, // Fixed width to match camera mode button
  paddingBottom: 10, // Push button up to align with gallery button
}

const $shutterButton: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderWidth: 4,
  borderColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
}

const $shutterButtonInner: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#fff",
}

const $flashOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#ffffff",
  pointerEvents: "none",
}

const $previewOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
}

const $previewContainer: ViewStyle = {
  width: "80%",
  height: "80%",
  justifyContent: "center",
  alignItems: "center",
}

const $previewImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $galleryButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
  justifyContent: "center",
  alignItems: "center",
}

const $cameraModeButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
  justifyContent: "center", // Center content when collapsed
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

const $chevronContainer: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 44, // Fixed height for chevron area
  paddingVertical: 8,
  alignItems: "center",
  justifyContent: "center",
}

const $controlsContainer: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 44, // Leave space for chevron at bottom
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: 12,
}

const $controlButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 4,
}

// Vertical Exposure Controls Styles
const $exposureControlsVertical: ViewStyle = {
  position: "absolute",
  bottom: 300, // Position well above the camera mode button to avoid overlap
  right: 40, // Same right position as camera mode button
  width: 60,
  height: 200, // Same height as expanded camera mode button
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

// Landscape-specific exposure controls (positioned above camera mode button)
const $exposureControlsVerticalLandscape: ViewStyle = {
  position: "absolute",
  right: 40,
  top: "50%",
  transform: [{ translateY: -200 }], // Position above camera mode button
  width: 60,
  height: 200,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2,
}

const $exposureSliderContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  height: 160,
}

const $gluestackSlider: ViewStyle = {
  height: 100,
  width: 4,
}

const $sliderTrack: ViewStyle = {
  height: 100,
  width: 4,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderRadius: 2,
}

const $sliderFilledTrack: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.6)",
}

const $sliderThumb: ViewStyle = {
  backgroundColor: "#fff",
  width: 20,
  height: 20,
  borderRadius: 10,
}

const $exposureLabel: TextStyle = {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
}

const $unifiedOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  zIndex: 1,
}



const $zoomIndicator: ViewStyle = {
  position: "absolute",
  bottom: 200, // Position above the shutter button area
  left: "50%",
  marginLeft: -30, // Center horizontally (adjust based on content width)
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}

// Landscape-specific zoom indicator (moved to top-right)
const $zoomIndicatorLandscape: ViewStyle = {
  position: "absolute",
  top: 60,
  right: 20,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}

const $zoomText: TextStyle = {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
}

const $orientationIndicator: ViewStyle = {
  position: "absolute",
  top: 100,
  left: 20,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
}

// Landscape-specific orientation indicator (moved to top-left, below zoom)
const $orientationIndicatorLandscape: ViewStyle = {
  position: "absolute",
  top: 100,
  left: 20,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
}

const $orientationText: TextStyle = {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
}

const $focusRing: ViewStyle = {
  position: "absolute",
  width: 100,
  height: 100,
  borderWidth: 2,
  borderColor: "#FFD700", // Gold color like iPhone
  borderRadius: 50,
  backgroundColor: "transparent",
}

const $aeLockIndicator: ViewStyle = {
  position: "absolute",
  top: 100,
  left: 20,
  backgroundColor: "rgba(255, 215, 0, 0.9)", // Gold background
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}

const $aeLockText: TextStyle = {
  color: "#000",
  fontSize: 12,
  fontWeight: "bold",
}

