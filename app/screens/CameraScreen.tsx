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
import { BlurView } from "@react-native-community/blur"
import { LinearGradient } from "expo-linear-gradient"
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
import { writeAsync } from '@lodev09/react-native-exify'
import { useIconRotation } from '@/hooks/useIconRotation'
import { useCameraControls } from '@/hooks/useCameraControls'
import { useCameraGestures } from '@/hooks/useCameraGestures'
import { useCameraAnimations } from '@/hooks/useCameraAnimations'
import { useTemplates } from '@/templates/hooks/useTemplates'
import { TemplateDrawer, TemplateOverlay } from '@/components/TemplateDrawer'
import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Create Reanimated Camera component for animated exposure
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { BlurButton } from "@/components/BlurButton"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators/AppNavigator"
import { photoLibraryService } from "@/services/photoLibrary"


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
  
  // Template system state
  const [isTemplateDrawerVisible, setIsTemplateDrawerVisible] = useState(false)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  const cameraViewRef = useRef<View | null>(null)
  
  // Initialize template system
  const { templates, activateTemplate, deactivateTemplate } = useTemplates()
  
  // Template selection handler
  const handleTemplateSelect = async (templateId: string) => {
    try {
      setCurrentTemplateId(templateId)
      await activateTemplate(templateId)
      setIsTemplateDrawerVisible(false)
    } catch (error) {
      console.error('Error selecting template:', error)
    }
  }
  
  // Template drawer handlers
  const handleTemplateDrawerOpen = () => {
    setIsTemplateDrawerVisible(true)
  }
  
  const handleTemplateDrawerClose = () => {
    setIsTemplateDrawerVisible(false)
  }
  
  





  const { hasPermission, requestPermission } = useCameraPermission()
  // Use camera device with ultra-wide support for zoom out below 1x
  const device = useCameraDevice("back", {
    physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera", "telephoto-camera"],
  })

  // Initialize zoom with device's neutral zoom (as per Vision Camera docs)
  const zoom = useSharedValue(device?.neutralZoom ?? 1)
  const zoomOffset = useSharedValue(0)

  // Popup state management with active interaction priority
  const [popupState, setPopupState] = useState({
    type: null as 'zoom' | 'flash' | null,
    value: '',
    visible: false,
    activeInteraction: null as 'zoom' | 'flash' | null,
    flashTimeout: null as NodeJS.Timeout | null
  })
  
  // Shared value for popup visibility animation
  const popupVisible = useSharedValue(0)

  // Use camera controls hook
  const {
    flashMode,
    flashModeRef,
    handleFlashToggle,
    flashAnimation,
    captureFlash,
    setCaptureFlash,
    isCameraModeExpanded,
    cameraModeExpansion,
    toggleCameraModeExpansion,
    showExposureControls,
    isExposureControlsVisible,
    exposureControlsAnimation,
    exposureSlider,
    sliderValue,
    toggleExposureControls,
    handleExposureSliderChange,
    resetExposure,
    isCapturing,
    setIsCapturing,
    shutterPressed,
    setShutterPressed,
    triggerHaptic,
    closeAllControls,
  } = useCameraControls({
    device,
    zoom,
    popupVisible,
    setPopupState
  })

  
  // Debug device zoom info
  useEffect(() => {
    if (device) {
      // Device info logged for debugging if needed
    }
  }, [device])
  
  


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



  // Exposure state
  
  

  // REVERSIBLE ANIMATION: Navigation state for camera animation (COMMENTED OUT FOR TESTING)
  // const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  // const [navigationProgress, setNavigationProgress] = useState(0) // 0-1 progress
  // const cameraOffset = useSharedValue(0) // Camera push-up offset

  

  // Device orientation for icon rotation (using custom hook)
  const { animatedIconStyle: galleryIconStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })

  // Flash icon rotation
  const { animatedIconStyle: flashIconStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })

  // Exposure icon rotation
  const { animatedIconStyle: exposureIconStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })

  // Crop icon rotation
  const { animatedIconStyle: cropIconStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })

  // Popup text rotation for device orientation
  const { animatedIconStyle: popupTextStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })

  // Exposure label rotation (+2 and -2 text)
  const { animatedIconStyle: exposureLabelStyle } = useIconRotation({
    damping: 20,
    stiffness: 300,
    enabled: true
  })



  // Preview state
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false) // Controls actual rendering

  useEffect(() => {
    setCameraPermission(hasPermission)
  }, [hasPermission])

  // REVERSIBLE ANIMATION: Animate camera offset based on navigation progress (COMMENTED OUT)
  // useEffect(() => {
  //   const targetOffset = navigationProgress * 80 // 0-80px based on progress
  //   cameraOffset.value = withTiming(targetOffset, {
  //     duration: 100, // Very fast for real-time tracking
  //   })
  // }, [navigationProgress, cameraOffset])



  // Initialize zoom with device's neutral zoom when device changes
  useEffect(() => {
    if (device) {
      zoom.value = device.neutralZoom ?? 1
    }
  }, [device, zoom])



  
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
      return
    }

    try {
      setIsCapturing(true)


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
      
      const photoPromise = _cameraRef.current.takePhoto(photoOptions)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Photo capture timeout')), 5000)
      )
      
      const photo = await Promise.race([photoPromise, timeoutPromise])

      // Navigate to preview screen (don't save yet - let user decide)
      const photoPath = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`
      
      // Navigate to PreviewScreen
      navigation.navigate('Preview', { 
        photoPath
      })

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

  // Use camera gestures hook
  const {
    showFocusRing,
    focusRingOpacity,
    focusRingPosition,
    _cameraRef,
    setCameraRef,
    shutterButtonGesture,
    cameraGestures,
    handleFocusTap,
  } = useCameraGestures({
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
  })


  const navigateToGallery = useCallback(() => {
    navigation.navigate("Gallery")
  }, [navigation])



  // Update camera zoom when zoom value changes
  const [cameraZoom, setCameraZoom] = useState(device?.neutralZoom ?? 1)

  // Use camera animations hook
  const {
    previewAnimation,
    exposureValue,
    animatedCameraProps,
    animatedCameraModeStyle,
    animatedCameraControlsOpacity,
    animatedFlashStyle,
    animatedPreviewStyle,
    animatedFocusRingStyle,
    animatedChevronStyle,
    animatedPopupStyle,
    animatedExposureControlsStyle,
  } = useCameraAnimations({
    device,
    zoom,
    zoomOffset,
    popupVisible,
    cameraModeExpansion,
    flashAnimation,
    exposureControlsAnimation,
    exposureSlider,
    focusRingOpacity,
    focusRingPosition,
    setCameraZoom
  })

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
      <Screen preset="fixed" style={$container} cameraMode={true} systemBarStyle="light">
        {/* Camera Content - Show black viewfinder with controls */}
        <GestureDetector gesture={cameraGestures}>
          <Reanimated.View style={$cameraContainer}>
            <View style={StyleSheet.absoluteFill}>
              {/* Black viewfinder when no camera available */}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
              
              {/* Error message overlay */}
              <View style={$noCameraOverlay}>
                <Ionicons name="camera-outline" size={48} color="#ff6b6b" />
                <Text style={$noCameraTitle}>No Camera Found</Text>
                <Text style={$noCameraSubtitle}>No camera device available on this device.</Text>
              </View>

              {/* Flash overlay for photo capture feedback */}
              <Reanimated.View style={[$flashOverlay, animatedFlashStyle]} />

              {/* Focus Ring - Only show when focusing */}
              {showFocusRing && <Reanimated.View style={[$focusRing, animatedFocusRingStyle]} />}

              {/* Popup Indicator - Shows zoom level or flash status */}
              {popupState.visible && (
                <Reanimated.View style={[$popupIndicator, animatedPopupStyle]}>
                  <View style={$popupBlurBackground}>
                    <BlurView
                      style={$popupBlurView}
                      blurType="light"
                      blurAmount={7}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                    />
                    <View style={$popupTextContent}>
                      <View style={$popupTextContainer}>
                        <Reanimated.View style={popupTextStyle}>
                          <Text style={$popupText}>
                            {popupState.value || 'No Value'}
                          </Text>
                        </Reanimated.View>
                      </View>
                    </View>
                  </View>
                </Reanimated.View>
              )}

              {/* Exposure Controls - Gluestack Slider */}
              {isExposureControlsVisible && (
                <Reanimated.View style={[$exposureControlsVertical, animatedExposureControlsStyle]}>
                  <BlurButton
                    onPress={() => {}} // No press action needed for container
                    style={$exposureControlsBlur}
                    blurType="light"
                    blurAmount={7}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                    disabled={true}
                  >
                    <View style={$exposureSliderContainer}>
                      <Reanimated.View style={exposureLabelStyle}>
                        <Text style={$exposureLabel}>+2</Text>
                      </Reanimated.View>
                      <View style={$sliderWrapper}>
                        {/* Neutral position indicator line */}
                        <View style={$neutralPositionLine} />
                        <Slider
                          value={sliderValue}
                          onChange={handleExposureSliderChange}
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
                      </View>
                      <Reanimated.View style={exposureLabelStyle}>
                        <Text style={$exposureLabel}>-2</Text>
                      </Reanimated.View>
                    </View>
                  </BlurButton>
                </Reanimated.View>
              )}
            </View>

            {/* Unified click away overlay for menus */}
            {(isCameraModeExpanded || showExposureControls) && (
              <TouchableOpacity 
                style={$unifiedOverlay}
                onPress={closeAllControls}
                activeOpacity={1}
              />
            )}

            {/* Bottom Controls - iPhone-style layout */}
            <View style={$bottomControls}>
              {/* Left Container: Gallery Button */}
              <View style={$leftControlsContainer}>
                <BlurButton
                  onPress={navigateToGallery}
                  icon={Ionicons}
                  iconProps={{
                    name: "images-outline",
                    size: 24,
                    color: "#fff"
                  }}
                  style={$galleryButton}
                  blurType="light"
                  blurAmount={7}
                  reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                >
                  <Reanimated.View style={galleryIconStyle}>
                    <Ionicons 
                      name="images-outline" 
                      size={24} 
                      color="#fff" 
                    />
                  </Reanimated.View>
                </BlurButton>
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
                <Reanimated.View style={[animatedCameraModeStyle, $cameraModeContainer]}>
                  {/* Main expanding background with blur */}
                  <BlurView
                    style={$cameraModeBlurBackground}
                    blurType="light"
                    blurAmount={7}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                  />
                  
                  {/* Camera control buttons - only visible when expanded */}
                  <Reanimated.View style={[$controlsContainer, animatedCameraControlsOpacity]}>
                    <BlurButton
                      onPress={handleFlashToggle}
                      style={$controlButton}
                      blurType="light"
                      blurAmount={5}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                    >
                      <Reanimated.View style={flashIconStyle}>
                        <Ionicons 
                          name={
                            flashMode === 'auto' ? 'flash-outline' :
                            flashMode === 'on' ? 'flash' :
                            'flash-off-outline'
                          }
                          size={20} 
                          color="#fff" 
                        />
                      </Reanimated.View>
                    </BlurButton>
                    
                    <BlurButton
                      onPress={toggleExposureControls}
                      style={$controlButton}
                      blurType="light"
                      blurAmount={5}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                    >
                      <Reanimated.View style={exposureIconStyle}>
                        <Ionicons 
                          name="contrast-outline" 
                          size={20} 
                          color="#fff" 
                        />
                      </Reanimated.View>
                    </BlurButton>
                    
                    <BlurButton
                      onPress={() => {}} // TODO: Add crop functionality
                      style={$controlButton}
                      blurType="light"
                      blurAmount={5}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                    >
                      <Reanimated.View style={cropIconStyle}>
                        <Ionicons 
                          name="crop-outline" 
                          size={20} 
                          color="#fff" 
                        />
                      </Reanimated.View>
                    </BlurButton>
                  </Reanimated.View>
                  
                  {/* Main chevron button - always visible at bottom */}
                  <TouchableOpacity
                    onPress={toggleCameraModeExpansion}
                    style={$chevronButtonContainer}
                    activeOpacity={0.6}
                  >
                    <Reanimated.View style={animatedChevronStyle}>
                      <Ionicons name="chevron-up-sharp" size={24} color="#fff" />
                    </Reanimated.View>
                  </TouchableOpacity>
                </Reanimated.View>
              </View>
            </View>
          </Reanimated.View>
        </GestureDetector>
        
        {/* Template Drawer */}
        <TemplateDrawer
          isVisible={isTemplateDrawerVisible}
          onClose={handleTemplateDrawerClose}
          onTemplateSelect={handleTemplateSelect}
        />
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" style={$container} cameraMode={true} systemBarStyle="light">
      {/* Camera Content - Static positioning (animation disabled for testing) */}
      <GestureDetector gesture={cameraGestures}>
        <Reanimated.View style={$cameraContainer}>
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
              resizeMode="contain" // Change from "cover" to "contain"
            />
            
            {/* Gradient layers - positioned to avoid viewfinder area */}
            {/* JSX order is inverse: renders from bottom up, layering on top of each other */}
            <View style={$gradientLayer8} />
            <View style={$gradientLayer7} />
            <View style={$gradientLayer6} />
            <View style={$gradientLayer5} />
            <View style={$gradientLayer4} />
            <View style={$gradientLayer3} />
            <View style={$gradientLayer2} />
            <View style={$gradientLayer1} />
            
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



            {/* Template Overlay - Render selected template */}
            {currentTemplateId && (
              <TemplateOverlay
                templateId={currentTemplateId}
                screenDimensions={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              />
            )}

            {/* Focus Ring - Only show when focusing */}
            {showFocusRing && <Reanimated.View style={[$focusRing, animatedFocusRingStyle]} />}

            {/* Popup Indicator - Shows zoom level or flash status */}
            {popupState.visible && (
              <Reanimated.View style={[$popupIndicator, animatedPopupStyle]}>
                <View style={$popupBlurBackground}>
                  <BlurView
                    style={$popupBlurView}
                    blurType="light"
                    blurAmount={7}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                  />
                  <View style={$popupTextContent}>
                    <View style={$popupTextContainer}>
                      <Reanimated.View style={popupTextStyle}>
                        <Text style={$popupText}>
                          {popupState.value || 'No Value'}
                        </Text>
                      </Reanimated.View>
                    </View>
                  </View>
                </View>
              </Reanimated.View>
            )}



            {/* Exposure Controls - Gluestack Slider */}
            {isExposureControlsVisible && (
              <Reanimated.View style={[$exposureControlsVertical, animatedExposureControlsStyle]}>
                <BlurButton
                  onPress={() => {}} // No press action needed for container
                  style={$exposureControlsBlur}
                  blurType="light"
                  blurAmount={7}
                  reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                  disabled={true}
                >
                  <View style={$exposureSliderContainer}>
                    <Reanimated.View style={exposureLabelStyle}>
                      <Text style={$exposureLabel}>+2</Text>
                    </Reanimated.View>
                    <View style={$sliderWrapper}>
                      {/* Neutral position indicator line */}
                      <View style={$neutralPositionLine} />
                      <Slider
                        value={sliderValue}
                        onChange={handleExposureSliderChange}
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
                    </View>
                    <Reanimated.View style={exposureLabelStyle}>
                      <Text style={$exposureLabel}>-2</Text>
                    </Reanimated.View>
                  </View>
                </BlurButton>
              </Reanimated.View>
            )}
          </View>

          {/* Unified click away overlay for menus (not preview) */}
          {(isCameraModeExpanded || showExposureControls) && !showPreview && (
            <TouchableOpacity 
              style={$unifiedOverlay}
              onPress={closeAllControls}
              activeOpacity={1}
            />
          )}

          {/* Bottom Controls - iPhone-style layout */}
          <View style={$bottomControls}>
            {/* Left Container: Gallery Button */}
            <View style={$leftControlsContainer}>
              <BlurButton
                onPress={navigateToGallery}
                icon={Ionicons}
                iconProps={{
                  name: "images-outline",
                  size: 24,
                  color: "#fff"
                }}
                style={$galleryButton}
                blurType="light"
                blurAmount={7}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
              >
                <Reanimated.View style={galleryIconStyle}>
                  <Ionicons 
                    name="images-outline" 
                    size={24} 
                    color="#fff" 
                  />
                </Reanimated.View>
              </BlurButton>
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

            {/* Right Container: Template Button and Camera Mode Button */}
            <View style={$rightControlsContainer}>
              {/* Template Button */}
              <BlurButton
                onPress={handleTemplateDrawerOpen}
                style={$templateButton}
                blurType="light"
                blurAmount={7}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
              >
                <Ionicons 
                  name="grid-outline" 
                  size={24} 
                  color="#fff" 
                />
              </BlurButton>
              
              <Reanimated.View style={[animatedCameraModeStyle, $cameraModeContainer]}>
                {/* Main expanding background with blur */}
                <BlurView
                  style={$cameraModeBlurBackground}
                  blurType="light"
                  blurAmount={7}
                  reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                />
                
                {/* Camera control buttons - only visible when expanded */}
                <Reanimated.View style={[$controlsContainer, animatedCameraControlsOpacity]}>
                  <BlurButton
                    onPress={handleFlashToggle}
                    style={$controlButton}
                    blurType="light"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                  >
                    <Reanimated.View style={flashIconStyle}>
                      <Ionicons 
                        name={
                          flashMode === 'auto' ? 'flash-outline' :
                          flashMode === 'on' ? 'flash' :
                          'flash-off-outline'
                        }
                        size={20} 
                        color="#fff" 
                      />
                    </Reanimated.View>
                  </BlurButton>
                  
                  <BlurButton
                    onPress={toggleExposureControls}
                    style={$controlButton}
                    blurType="light"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                  >
                    <Reanimated.View style={exposureIconStyle}>
                      <Ionicons 
                        name="contrast-outline" 
                        size={20} 
                        color="#fff" 
                      />
                    </Reanimated.View>
                  </BlurButton>
                  
                  <BlurButton
                    onPress={() => {}} // TODO: Add crop functionality
                    style={$controlButton}
                    blurType="light"
                    blurAmount={5}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.1)"
                  >
                    <Reanimated.View style={cropIconStyle}>
                      <Ionicons 
                        name="crop-outline" 
                        size={20} 
                        color="#fff" 
                      />
                    </Reanimated.View>
                  </BlurButton>
                </Reanimated.View>
                
                {/* Main chevron button - always visible at bottom */}
                <TouchableOpacity
                  onPress={toggleCameraModeExpansion}
                  style={$chevronButtonContainer}
                  activeOpacity={0.6}
                >
                  <Reanimated.View style={animatedChevronStyle}>
                    <Ionicons name="chevron-up-sharp" size={24} color="#fff" />
                  </Reanimated.View>
                </TouchableOpacity>
              </Reanimated.View>
            </View>
            </View>
          </Reanimated.View>
        </GestureDetector>
        
        {/* Template Drawer */}
        <TemplateDrawer
          isVisible={isTemplateDrawerVisible}
          onClose={handleTemplateDrawerClose}
          onTemplateSelect={handleTemplateSelect}
        />
      </Screen>
    )
  }

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#0b0b0b", // Background - slightly lighter than layer 8
}

// Gradient layers - Layer 1 is innermost (darkest), Layer 8 is outermost (lightest)
const $gradientLayer1: ViewStyle = {
  position: "absolute",
  top: "3.0%",    // 3.0% gap from top edge (happy medium)
  bottom: "3.0%", // 3.0% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "black", // Pure black - darkest (innermost)
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer2: ViewStyle = {
  position: "absolute",
  top: "2.6%",    // 2.6% gap from top edge (happy medium)
  bottom: "2.6%", // 2.6% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#040404", // Almost black
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer3: ViewStyle = {
  position: "absolute",
  top: "2.2%",    // 2.2% gap from top edge (happy medium)
  bottom: "2.2%", // 2.2% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#060606", // Very dark
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer4: ViewStyle = {
  position: "absolute",
  top: "1.8%",    // 1.8% gap from top edge (happy medium)
  bottom: "1.8%", // 1.8% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#080808", // slightly lighter than layer 3
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer5: ViewStyle = {
  position: "absolute",
  top: "1.4%",    // 1.4% gap from top edge (happy medium)
  bottom: "1.4%", // 1.4% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0a0a0a", // slightly lighter than layer 4
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer6: ViewStyle = {
  position: "absolute",
  top: "1.0%",    // 1.0% gap from top edge (happy medium)
  bottom: "1.0%", // 1.0% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0c0c0c", // Slightly lighter than layer 5
  opacity: 0.7,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer7: ViewStyle = {
  position: "absolute",
  top: "0.6%",    // 0.6% gap from top edge (happy medium)
  bottom: "0.6%", // 0.6% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0e0e0e", // Very subtle difference
  opacity: 0.8,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

const $gradientLayer8: ViewStyle = {
  position: "absolute",
  top: "0.2%",    // 0.2% gap from top edge (happy medium)
  bottom: "0.2%", // 0.2% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0d0d0d", // Slight darker than background (outermost)
  opacity: 0.8,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
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
  bottom: 85, // Moved up 5px from 80 to give more breathing room from viewfinder edge
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
  borderWidth: 1,
  borderColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
}

const $shutterButtonInner: ViewStyle = {
  width: 70,
  height: 70,
  borderRadius: 45,
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
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
}

const $templateButton: ViewStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10, // Add some spacing from the camera mode button
}

const $cameraModeButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
  justifyContent: "center", // Center content when collapsed
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

const $cameraModeContainer: ViewStyle = {
  width: 60,
  borderRadius: 30,
  overflow: "hidden",
  position: "relative",
}

const $cameraModeBlurBackground: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 30,
}

const $chevronButtonContainer: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 44, // Fixed height for chevron area
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1, // Above the blur background
}

const $chevronButton: ViewStyle = {
  width: 60,
  height: 44,
  borderRadius: 22,
}

const $chevronContainer: ViewStyle = {
  flex: 1,
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
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

const $exposureControlsBlur: ViewStyle = {
  width: 60,
  height: 200,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
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





const $focusRing: ViewStyle = {
  position: "absolute",
  width: 100,
  height: 100,
  borderWidth: 2,
  borderColor: "#FFD700", // Gold color like iPhone
  borderRadius: 50,
  backgroundColor: "transparent",
}

// Popup Indicator Styles
const $popupIndicator: ViewStyle = {
  position: "absolute",
  bottom: 180, // Position above the shutter button area
  left: "50%",
  marginLeft: -30, // Center horizontally (adjust based on content width)
  zIndex: 10, // Above other elements
}

const $popupBlurBackground: ViewStyle = {
  position: "relative",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 18,
  minWidth: 60,
  overflow: "hidden",
}

const $popupBlurView: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 16,
}

const $popupTextContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
}

const $popupTextContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}

const $popupText: TextStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
  textAlign: "center",
}

// Slider wrapper for positioning the neutral line
const $sliderWrapper: ViewStyle = {
  position: "relative",
  height: 100,
  width: 4,
  justifyContent: "center",
  alignItems: "center",
}

// Neutral position indicator line
const $neutralPositionLine: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: -8, // Extend 8px to the left of the slider
  right: -8, // Extend 8px to the right of the slider
  height: 1,
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  zIndex: 0, // Behind the slider
}

// No Camera Overlay Styles
const $noCameraOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 5,
}

const $noCameraTitle: TextStyle = {
  color: "#ff6b6b",
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 16,
  textAlign: "center",
}

const $noCameraSubtitle: TextStyle = {
  color: "#ff6b6b",
  fontSize: 16,
  marginTop: 8,
  textAlign: "center",
  opacity: 0.8,
}


