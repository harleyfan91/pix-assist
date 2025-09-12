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
  SharedValue,
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
import { CameraControls } from '@/components/CameraControls'
import { Dimensions } from 'react-native'
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { log } from '@/services/logging'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const DRAWER_WIDTH = 390


// Create Reanimated Camera component for animated exposure
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { BlurButton } from "@/components/BlurButton"
import { useNavigation, useRoute } from "@react-navigation/native"
import { AppStackScreenProps } from "@/navigators/AppNavigator"
import { photoLibraryService } from "@/services/photoLibrary"
import * as styles from "./CameraScreen.styles"


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
  const route = useRoute<AppStackScreenProps<"Camera">["route"]>()
  
  // Template system state
  const [isTemplateDrawerVisible, setIsTemplateDrawerVisible] = useState(false)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  const cameraViewRef = useRef<View | null>(null)
  
  // Initialize template system
  const { templates, activateTemplate, deactivateTemplate } = useTemplates()
  
  // Initialize error handling
  const { handleAsync } = useErrorHandler()
  
  // Template drawer handlers
  const handleTemplateDrawerOpen = () => {
    setIsTemplateDrawerVisible(true)
    route.params?.onTemplateDrawerToggle?.(true)
  }
  
  
  // Template selection handler
  const handleTemplateSelect = useCallback(async (templateId: string) => {
    await handleAsync(
      async () => {
        setCurrentTemplateId(templateId)
        await activateTemplate(templateId)
        setIsTemplateDrawerVisible(false)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to select template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'select', templateId },
      }
    )
  }, [handleAsync, activateTemplate])

  const handleTemplateDrawerClose = () => {
    setIsTemplateDrawerVisible(false)
    route.params?.onTemplateDrawerToggle?.(false)
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
    log.camera("Attempting camera recovery from zoom error")
    setCameraError("Camera temporarily unavailable")
    setIsActive(false)
    
    setTimeout(() => {
      log.camera("Resuming camera after recovery")
      setIsActive(true)
      setCameraError(null)
      // Reset zoom to neutral to prevent further errors
      if (device) {
        zoom.value = device.neutralZoom
      }
    }, 2000)
  }, [device, zoom])



  // Exposure state
  
  

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

    await handleAsync(
      async () => {
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
        
        const photoPromise = _cameraRef.current!.takePhoto(photoOptions)
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
      },
      {
        category: ErrorCategory.CAMERA,
        userMessage: 'Unable to take photo. Please try again.',
        severity: ErrorSeverity.HIGH,
        context: { operation: 'capture', flashMode: flashModeRef.current },
        onError: (error) => {
          // Handle specific AVFoundation errors with camera recovery
          const errorMessage = error.originalError?.message || ''
          if (errorMessage.includes('AVFoundationErrorDomain') || 
              errorMessage.includes('Cannot Complete Action')) {
            log.camera("AVFoundation error detected - attempting camera recovery")
            setCameraError("Camera temporarily unavailable")
            
            // Try to recover by briefly pausing and resuming camera
            setIsActive(false)
            setTimeout(() => {
              log.camera("Attempting camera recovery")
              setIsActive(true)
              setCameraError(null)
            }, 2000)
          }
        }
      }
    ).finally(() => {
      setIsCapturing(false)
      setCaptureFlash(false)
      // Ensure flash animation is reset
      flashAnimation.value = 0
    })
  }, [isCapturing, flashAnimation, handleAsync, navigation, flashModeRef, setCaptureFlash, flashAnimation, setIsCapturing, setCameraError, setIsActive])

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
      <Screen preset="fixed" contentContainerStyle={styles.$container}>
        <View style={styles.$content}>
          <Text preset="heading" text="📷 TESTING RELOAD..." />
        </View>
      </Screen>
    )
  }

  if (!cameraPermission) {
    return (
      <Screen preset="fixed" contentContainerStyle={styles.$container}>
        <View style={styles.$content}>
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
      <Screen preset="fixed" style={[styles.$container, { overflow: 'visible' }]} cameraMode={true} systemBarStyle="light">
        {/* Camera Content - Show black viewfinder with controls */}
        <GestureDetector gesture={cameraGestures}>
          <Reanimated.View style={styles.$cameraContainer}>
            <View style={StyleSheet.absoluteFill}>
              {/* Black viewfinder when no camera available */}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
              
              {/* Error message overlay */}
              <View style={styles.$noCameraOverlay}>
                <Ionicons name="camera-outline" size={48} color="#ff6b6b" />
                <Text style={styles.$noCameraTitle}>No Camera Found</Text>
                <Text style={styles.$noCameraSubtitle}>No camera device available on this device.</Text>
              </View>

              {/* Flash overlay for photo capture feedback */}
              <Reanimated.View style={[styles.$flashOverlay, animatedFlashStyle]} />

              {/* Focus Ring - Only show when focusing */}
              {showFocusRing && <Reanimated.View style={[styles.$focusRing, animatedFocusRingStyle]} />}

              {/* Popup Indicator - Shows zoom level or flash status */}
              {popupState.visible && (
                <Reanimated.View style={[styles.$popupIndicator, animatedPopupStyle]}>
                  <View style={styles.$popupBlurBackground}>
                    <BlurView
                      style={styles.$popupBlurView}
                      blurType="light"
                      blurAmount={7}
                      reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                    />
                    <View style={styles.$popupTextContent}>
                      <View style={styles.$popupTextContainer}>
                        <Reanimated.View style={popupTextStyle}>
                          <Text style={styles.$popupText}>
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
                <Reanimated.View style={[styles.$exposureControlsVertical, animatedExposureControlsStyle]}>
                  <BlurButton
                    onPress={() => {}} // No press action needed for container
                    style={styles.$exposureControlsBlur}
                    blurType="light"
                    blurAmount={7}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                    disabled={true}
                  >
                    <View style={styles.$exposureSliderContainer}>
                      <Reanimated.View style={exposureLabelStyle}>
                        <Text style={styles.$exposureLabel}>+2</Text>
                      </Reanimated.View>
                      <View style={styles.$sliderWrapper}>
                        {/* Neutral position indicator line */}
                        <View style={styles.$neutralPositionLine} />
                        <Slider
                          value={sliderValue}
                          onChange={handleExposureSliderChange}
                          minValue={-1}
                          maxValue={1}
                          step={0.01}
                          orientation="vertical"
                          style={styles.$gluestackSlider}
                        >
                          <SliderTrack style={styles.$sliderTrack}>
                            <SliderFilledTrack style={styles.$sliderFilledTrack} />
                          </SliderTrack>
                          <SliderThumb style={styles.$sliderThumb} />
                        </Slider>
                      </View>
                      <Reanimated.View style={exposureLabelStyle}>
                        <Text style={styles.$exposureLabel}>-2</Text>
                      </Reanimated.View>
                    </View>
                  </BlurButton>
                </Reanimated.View>
              )}
            </View>

            {/* Unified click away overlay for menus */}
            {(isCameraModeExpanded || showExposureControls) && (
              <TouchableOpacity 
                style={styles.$unifiedOverlay}
                onPress={closeAllControls}
                activeOpacity={1}
              />
            )}

            {/* Bottom Controls - iPhone-style layout */}
            <CameraControls
              onNavigateToGallery={navigateToGallery}
              shutterButtonGesture={shutterButtonGesture}
              shutterPressed={shutterPressed}
              isCapturing={isCapturing}
              animatedCameraModeStyle={animatedCameraModeStyle}
              animatedCameraControlsOpacity={animatedCameraControlsOpacity}
              animatedChevronStyle={animatedChevronStyle}
              onToggleCameraModeExpansion={toggleCameraModeExpansion}
              onFlashToggle={handleFlashToggle}
              flashMode={flashMode}
              flashIconStyle={flashIconStyle}
              onToggleExposureControls={toggleExposureControls}
              exposureIconStyle={exposureIconStyle}
              cropIconStyle={cropIconStyle}
              galleryIconStyle={galleryIconStyle}
            />
          </Reanimated.View>
        </GestureDetector>
        
        
        
        
        {/* Template Drawer */}
        <TemplateDrawer
          isVisible={isTemplateDrawerVisible}
          onClose={handleTemplateDrawerClose}
          onOpen={handleTemplateDrawerOpen}
          onTemplateSelect={handleTemplateSelect}
        />
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" style={styles.$container} cameraMode={true} systemBarStyle="light">
      {/* Camera Content - Static positioning (animation disabled for testing) */}
      <GestureDetector gesture={cameraGestures}>
        <Reanimated.View style={styles.$cameraContainer}>
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
                // Use centralized error handling for camera errors
                handleAsync(
                  async () => {
                    throw error
                  },
                  {
                    category: ErrorCategory.CAMERA,
                    userMessage: 'Camera encountered an error. Attempting to recover...',
                    severity: ErrorSeverity.HIGH,
                    context: { operation: 'camera_init', errorType: 'camera_error' },
                    onError: (appError) => {
                      const errorMessage = appError.originalError?.message || ''
                      if (errorMessage.includes('AVFoundationErrorDomain') || 
                          errorMessage.includes('Cannot Complete Action')) {
                        recoverFromCameraError()
                      }
                    }
                  }
                )
              }}
              resizeMode="contain" // Change from "cover" to "contain"
            />
            
            {/* Gradient layers - positioned to avoid viewfinder area */}
            {/* JSX order is inverse: renders from bottom up, layering on top of each other */}
            <View style={styles.$gradientLayer8} />
            <View style={styles.$gradientLayer7} />
            <View style={styles.$gradientLayer6} />
            <View style={styles.$gradientLayer5} />
            <View style={styles.$gradientLayer4} />
            <View style={styles.$gradientLayer3} />
            <View style={styles.$gradientLayer2} />
            <View style={styles.$gradientLayer1} />
            
            {/* Flash overlay for photo capture feedback */}
            <Reanimated.View style={[styles.$flashOverlay, animatedFlashStyle]} />

            {/* Preview overlay - shows captured photo for 2 seconds */}
            {isPreviewVisible && capturedPhoto && (
              <TouchableOpacity 
                style={styles.$previewOverlay}
                onPress={() => {
                  // Navigate to full preview screen
                  navigation.navigate("Preview", { photoPath: capturedPhoto })
                }}
                activeOpacity={0.9}
              >
                <Reanimated.View style={[styles.$previewContainer, animatedPreviewStyle]}>
                  <Image 
                    source={{ uri: capturedPhoto }} 
                    style={styles.$previewImage}
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
            {showFocusRing && <Reanimated.View style={[styles.$focusRing, animatedFocusRingStyle]} />}

            {/* Popup Indicator - Shows zoom level or flash status */}
            {popupState.visible && (
              <Reanimated.View style={[styles.$popupIndicator, animatedPopupStyle]}>
                <View style={styles.$popupBlurBackground}>
                  <BlurView
                    style={styles.$popupBlurView}
                    blurType="light"
                    blurAmount={7}
                    reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                  />
                  <View style={styles.$popupTextContent}>
                    <View style={styles.$popupTextContainer}>
                      <Reanimated.View style={popupTextStyle}>
                        <Text style={styles.$popupText}>
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
              <Reanimated.View style={[styles.$exposureControlsVertical, animatedExposureControlsStyle]}>
                <BlurButton
                  onPress={() => {}} // No press action needed for container
                  style={styles.$exposureControlsBlur}
                  blurType="light"
                  blurAmount={7}
                  reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
                  disabled={true}
                >
                  <View style={styles.$exposureSliderContainer}>
                    <Reanimated.View style={exposureLabelStyle}>
                      <Text style={styles.$exposureLabel}>+2</Text>
                    </Reanimated.View>
                    <View style={styles.$sliderWrapper}>
                      {/* Neutral position indicator line */}
                      <View style={styles.$neutralPositionLine} />
                      <Slider
                        value={sliderValue}
                        onChange={handleExposureSliderChange}
                        minValue={-1}
                        maxValue={1}
                        step={0.01}
                        orientation="vertical"
                        style={styles.$gluestackSlider}
                      >
                        <SliderTrack style={styles.$sliderTrack}>
                          <SliderFilledTrack style={styles.$sliderFilledTrack} />
                        </SliderTrack>
                        <SliderThumb style={styles.$sliderThumb} />
                      </Slider>
                    </View>
                    <Reanimated.View style={exposureLabelStyle}>
                      <Text style={styles.$exposureLabel}>-2</Text>
                    </Reanimated.View>
                  </View>
                </BlurButton>
              </Reanimated.View>
            )}
          </View>

          {/* Unified click away overlay for menus (not preview) */}
          {(isCameraModeExpanded || showExposureControls) && !showPreview && (
            <TouchableOpacity 
              style={styles.$unifiedOverlay}
              onPress={closeAllControls}
              activeOpacity={1}
            />
          )}

          {/* Bottom Controls - iPhone-style layout */}
          <CameraControls
            onNavigateToGallery={navigateToGallery}
            shutterButtonGesture={shutterButtonGesture}
            shutterPressed={shutterPressed}
            isCapturing={isCapturing}
            animatedCameraModeStyle={animatedCameraModeStyle}
            animatedCameraControlsOpacity={animatedCameraControlsOpacity}
            animatedChevronStyle={animatedChevronStyle}
            onToggleCameraModeExpansion={toggleCameraModeExpansion}
            onFlashToggle={handleFlashToggle}
            flashMode={flashMode}
            flashIconStyle={flashIconStyle}
            onToggleExposureControls={toggleExposureControls}
            exposureIconStyle={exposureIconStyle}
            cropIconStyle={cropIconStyle}
            galleryIconStyle={galleryIconStyle}
          />
          </Reanimated.View>
        </GestureDetector>
        
        
        {/* Template Drawer */}
        <TemplateDrawer
          isVisible={isTemplateDrawerVisible}
          onClose={handleTemplateDrawerClose}
          onOpen={handleTemplateDrawerOpen}
          onTemplateSelect={handleTemplateSelect}
        />
      </Screen>
    )
  }
