import { FC, useCallback, useEffect, useState, useRef } from "react"
import {
  Alert,
  Linking,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native"
import { Button, ButtonText } from "@gluestack-ui/themed"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  runOnJS,
  interpolate,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"

// Create Reanimated Camera component for animated exposure
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TopNavigation } from "@/components/TopNavigation"

// Enable zoom animation for Reanimated (as per Vision Camera docs)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
  exposure: true,
})

export const CameraScreen: FC = function CameraScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isActive] = useState(true) // Always on by default

  const { hasPermission, requestPermission } = useCameraPermission()
  // Use camera device with ultra-wide support for zoom out below 1x
  const device = useCameraDevice("back", {
    physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera", "telephoto-camera"],
  })
  const _cameraRef = useRef<Camera>(null)
  
  // Callback ref to get camera instance
  const setCameraRef = useCallback((camera: Camera | null) => {
    _cameraRef.current = camera
  }, [])

  // Initialize zoom with device's neutral zoom (as per Vision Camera docs)
  const zoom = useSharedValue(device?.neutralZoom ?? 1)
  const zoomOffset = useSharedValue(0)
  const [currentZoom, setCurrentZoom] = useState(device?.neutralZoom ?? 1)

  // Focus and exposure state
  const [isFocusLocked, setIsFocusLocked] = useState(false)
  const [showFocusRing, setShowFocusRing] = useState(false)
  const focusRingOpacity = useSharedValue(0)
  const focusRingPosition = useSharedValue({ x: 0, y: 0 })
  
  // Exposure state
  const exposureSlider = useSharedValue(0) // -1 to 1 range
  const [showExposureControls, setShowExposureControls] = useState(false)
  const [currentEV, setCurrentEV] = useState("0.0 EV")

  // Navigation state for camera animation
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [navigationProgress, setNavigationProgress] = useState(0) // 0-1 progress
  const cameraOffset = useSharedValue(0) // Camera push-up offset

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

  const takePhoto = useCallback(() => {
    console.log("Taking photo...")
    // TODO: Implement photo capture
  }, [])

  const toggleExposureControls = useCallback(() => {
    setShowExposureControls(prev => !prev)
  }, [])

  // Button press states for visual feedback
  const [shutterPressed, setShutterPressed] = useState(false)
  const [evPressed, setEvPressed] = useState(false)

  // Create high-priority button gestures that will compete with camera gestures
  const shutterButtonGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      runOnJS(setShutterPressed)(true)
    })
    .onEnd(() => {
      'worklet'
      runOnJS(takePhoto)()
      runOnJS(setShutterPressed)(false)
    })
    .onFinalize(() => {
      'worklet'
      runOnJS(setShutterPressed)(false)
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
      runOnJS(handleFocusTap)(x, y)
    })
    .shouldCancelWhenOutside(true)

  // Create long press gesture for AE/AF lock
  const longPressGesture = Gesture.LongPress()
    .minDuration(500) // 500ms for long press
    .onStart(({ x, y }) => {
      'worklet'
      runOnJS(handleFocusLock)(x, y)
    })

  // Create pinch gesture following Vision Camera example
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet'
      zoomOffset.value = zoom.value
    })
    .onUpdate((event) => {
      'worklet'
      if (!device) return

      // Use a more direct approach for zoom calculation
      const baseZoom = zoomOffset.value
      const scaleFactor = event.scale
      const newZoom = baseZoom * scaleFactor

      // Clamp to reasonable limits (following best practices)
      const maxReasonableZoom = Math.min(device.maxZoom, 16) // Cap at 16x for usability
      const clampedZoom = Math.max(device.minZoom, Math.min(newZoom, maxReasonableZoom))
      zoom.value = clampedZoom
    })

  // Exposure pan gesture
  const exposurePanGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet'
      const sliderWidth = 200 // Approximate slider width
      const newValue = (event.x / sliderWidth) * 2 - 1 // Map to -1 to 1
      exposureSlider.value = Math.max(-1, Math.min(1, newValue))
      
      // Update EV display
      const evValue = interpolate(newValue, [-1, 0, 1], [-0.7, 0, 0.7])
      const evString = `${evValue > 0 ? '+' : ''}${evValue.toFixed(1)} EV`
      runOnJS(setCurrentEV)(evString)
    })
    .onEnd(() => {
      'worklet'
      // Optional: Add haptic feedback or snap to center
    })

  // Combine camera gestures (focus and zoom) - these compete with button gestures
  const cameraGestures = Gesture.Simultaneous(tapGesture, longPressGesture, pinchGesture)

  // Update camera zoom when zoom value changes
  const [cameraZoom, setCameraZoom] = useState(device?.neutralZoom ?? 1)
  
  // Update camera zoom when zoom value changes using derived value
  useDerivedValue(() => {
    runOnJS(setCameraZoom)(zoom.value)
  })

  // Animated style for camera container push-up effect
  const animatedCameraContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: cameraOffset.value }],
    }
  })

  // Map exposure slider to conservative EV range (-0.7 to +0.7 EV)
  const exposureValue = useDerivedValue(() => {
    if (!device) return 0
    // Map slider value (-1 to 1) to EV range (-0.7 to +0.7)
    const evValue = interpolate(exposureSlider.value, [-1, 0, 1], [-0.7, 0, 0.7])
    // Convert EV to device exposure value with very conservative mapping
    return evValue * (device.maxExposure - device.minExposure) * 0.1 // Only 10% of device range per EV
  }, [exposureSlider, device])

  // Create animated style for zoom indicator visibility
  const animatedZoomStyle = useAnimatedStyle(() => {
    const neutralZoom = device?.neutralZoom ?? 1
    const isZoomed = Math.abs(zoom.value - neutralZoom) > 0.1
    return {
      opacity: isZoomed ? 1 : 0,
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

  // Create animated style for exposure slider thumb
  const animatedThumbStyle = useAnimatedStyle(() => ({
    left: `${(exposureSlider.value + 1) * 50}%`, // Map -1 to 1 -> 0% to 100%
  }))

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
              animatedProps={animatedCameraProps}
            />

            {/* Zoom Indicator - Only show when zoomed */}
            <Reanimated.View style={[$zoomIndicator, animatedZoomStyle]}>
              <Text style={$zoomText}>{currentZoom.toFixed(1)}x</Text>
            </Reanimated.View>

            {/* Focus Ring - Only show when focusing */}
            {showFocusRing && <Reanimated.View style={[$focusRing, animatedFocusRingStyle]} />}

            {/* AE/AF Lock Indicator - Only show when locked */}
            {isFocusLocked && (
              <View style={$aeLockIndicator}>
                <Text style={$aeLockText}>AE/AF LOCK</Text>
              </View>
            )}

            {/* Exposure Controls Toggle Button */}
            <GestureDetector gesture={evButtonGesture}>
              <View style={[
                $exposureToggleButton,
                evPressed && { opacity: 0.6 }
              ]}>
                <Text style={$exposureToggleText}>EV</Text>
              </View>
            </GestureDetector>

            {/* Exposure Controls - Only show when toggled */}
            {showExposureControls && (
              <View style={$exposureControls}>
                <Text style={$exposureLabel}>Exposure</Text>
                <Text style={$exposureCurrentValue}>
                  {currentEV}
                </Text>
                <View style={$exposureSliderContainer}>
                  <Text style={$exposureValue}>-0.7</Text>
                  <View style={$exposureSlider}>
                    <View style={$exposureSliderTrack}>
                      <Reanimated.View 
                        style={[$exposureSliderThumb, animatedThumbStyle]} 
                      />
                    </View>
                    <GestureDetector gesture={exposurePanGesture}>
                      <View style={$exposureSliderArea} />
                    </GestureDetector>
                  </View>
                  <Text style={$exposureValue}>+0.7</Text>
                </View>
              </View>
            )}
          </View>

          {/* Shutter Button */}
          <View style={$bottomControls}>
            <GestureDetector gesture={shutterButtonGesture}>
              <View style={[
                $shutterButton,
                shutterPressed && { opacity: 0.6 }
              ]}>
                <View style={$shutterButtonInner} />
              </View>
            </GestureDetector>
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
  alignItems: "center",
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

const $zoomIndicator: ViewStyle = {
  position: "absolute",
  top: 60,
  left: 20,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}

const $zoomText: TextStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
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

// Exposure Controls Styles
const $exposureToggleButton: ViewStyle = {
  position: "absolute",
  top: 100, // Moved down to avoid navigation drawer
  right: 20,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 16,
}

const $exposureToggleText: TextStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
}

const $exposureControls: ViewStyle = {
  position: "absolute",
  bottom: 120,
  left: 20,
  right: 20,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  padding: 16,
  borderRadius: 12,
}

const $exposureLabel: TextStyle = {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 8,
  textAlign: "center",
}

const $exposureCurrentValue: TextStyle = {
  color: "#FFD700", // Gold color for current value
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 12,
  textAlign: "center",
}

const $exposureSliderContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $exposureValue: TextStyle = {
  color: "#fff",
  fontSize: 12,
  fontWeight: "bold",
  minWidth: 24,
  textAlign: "center",
}

const $exposureSlider: ViewStyle = {
  flex: 1,
  marginHorizontal: 16,
  height: 40,
  justifyContent: "center",
}

const $exposureSliderTrack: ViewStyle = {
  height: 4,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderRadius: 2,
  position: "relative",
}

const $exposureSliderThumb: ViewStyle = {
  position: "absolute",
  top: -8,
  width: 20,
  height: 20,
  backgroundColor: "#fff",
  borderRadius: 10,
  marginLeft: -10,
}

const $exposureSliderArea: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
}
