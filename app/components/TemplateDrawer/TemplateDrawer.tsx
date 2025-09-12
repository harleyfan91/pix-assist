import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Dimensions, TouchableOpacity, Image } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from '@react-native-community/blur'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  SharedValue,
} from 'react-native-reanimated'
import { TemplateCarousel } from './TemplateCarousel'
import { useCameraViewfinder } from '../../hooks/useCameraViewfinder'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const DRAWER_WIDTH = SCREEN_WIDTH // Cover entire screen width
const DRAWER_PEEK = 0 // No peek when closed


interface TemplateDrawerProps {
  isVisible: boolean
  onClose: () => void
  onOpen?: () => void
  onTemplateSelect: (templateId: string) => void
  cameraViewRef?: React.RefObject<View | null>
  onTranslateXChange?: (translateX: SharedValue<number>) => void
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
  isVisible,
  onClose,
  onOpen,
  onTemplateSelect,
  cameraViewRef,
  onTranslateXChange
}) => {
  const translateX = useSharedValue(DRAWER_WIDTH)
  const backdropOpacity = useSharedValue(0)
  const [selectedCategory, setSelectedCategory] = useState<'core' | 'pro'>('core')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const insets = useSafeAreaInsets()
  
  // Pass translateX to parent for edge detection area animation
  useEffect(() => {
    if (onTranslateXChange) {
      onTranslateXChange(translateX)
    }
  }, [translateX, onTranslateXChange])
  
  // Get camera viewfinder dimensions for visualization
  const cameraViewfinder = useCameraViewfinder()
  
  // Camera viewfinder dimensions for BlurView positioning
  // Using useCameraViewfinder hook for precise camera area calculation

  // Debug logging for drawer space
  console.log('Drawer space:', {
    screenHeight: SCREEN_HEIGHT,
    safeAreaTop: insets.top,
    availableHeight: SCREEN_HEIGHT - insets.top - 10 - 10, // screen - top padding - bottom padding
    categoryTabsHeight: 40, // estimated
    carouselMargin: 15,
    remainingSpace: SCREEN_HEIGHT - insets.top - 10 - 10 - 40 - 15
  })

  // REVERSIBLE ANIMATION: Drawer slide in/out animation
  useEffect(() => {
    if (isVisible) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 })
      backdropOpacity.value = withTiming(1, { duration: 300 })
    } else {
      translateX.value = withSpring(DRAWER_WIDTH, { damping: 20, stiffness: 200 })
      backdropOpacity.value = withTiming(0, { duration: 300 })
    }
  }, [isVisible])


  // Gesture handler for closing drawer
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX
      translateX.value = Math.max(0, Math.min(DRAWER_WIDTH, newTranslateX))
      
      // Update backdrop opacity based on position
      const progress = 1 - (translateX.value / DRAWER_WIDTH)
      backdropOpacity.value = progress
    },
    onEnd: (event) => {
      const shouldClose = event.translationX > DRAWER_WIDTH * 0.3 || event.velocityX > 500
      
      if (shouldClose) {
        translateX.value = withSpring(DRAWER_WIDTH)
        backdropOpacity.value = withTiming(0)
        runOnJS(onClose)()
      } else {
        translateX.value = withSpring(0)
        backdropOpacity.value = withTiming(1)
      }
    },
  })

  // Animated styles
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    backgroundColor: `rgba(0, 0, 0, ${interpolate(backdropOpacity.value, [0, 1], [0, 0.3])})`,
  }))






  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId)
    
    // Flash effect - briefly highlight selected template
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Close drawer and apply template
    translateX.value = withSpring(DRAWER_WIDTH, { damping: 20, stiffness: 200 })
    backdropOpacity.value = withTiming(0, { duration: 300 })
    
    setTimeout(() => {
      onTemplateSelect(templateId)
      onClose()
      setSelectedTemplateId(null)
    }, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          },
          backdropStyle,
        ]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      />


      {/* Drawer with VibrancyView Background */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0, // Start from left edge
              width: DRAWER_WIDTH,
              height: SCREEN_HEIGHT,
              zIndex: 999,
            },
            drawerStyle,
          ]}
        >
          {/* Top Blurred Section */}
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: cameraViewfinder.y, // From top to camera viewfinder start
            }}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
          />

          {/* Center Transparent Section */}
          <View
            style={{
              position: 'absolute',
              top: cameraViewfinder.y,
              left: cameraViewfinder.x,
              width: cameraViewfinder.width,
              height: cameraViewfinder.height,
              backgroundColor: 'transparent', // Fully transparent for center
            }}
          />

          {/* Bottom Blurred Section */}
          <BlurView
            style={{
              position: 'absolute',
              top: cameraViewfinder.y + cameraViewfinder.height,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
          />

          <View style={{ 
            paddingTop: insets.top + 5, // Add safe area top padding
            paddingBottom: 5,
            // Remove flex constraints that might compress the rectangle
          }}>
                   {/* TEMPLATE ALIGNMENT GUIDE - Camera Viewfinder Visualization */}
                   {/* 
                     This red rectangle shows the exact camera viewfinder area (82% of screen height)
                     Use this as a reference for template alignment and positioning
                     
                     Key positioning patterns:
                     1. Centered: top: (SCREEN_HEIGHT - viewfinder.height) / 2
                     2. Direct: top: viewfinder.y (for exact camera alignment)
                     3. Preview: scale down while maintaining aspect ratio
                     
                     See: app/hooks/useCameraViewfinder.md for detailed usage guide
                   */}
                   {/* 
                   <View style={{
                     position: 'absolute',
                     top: (SCREEN_HEIGHT - cameraViewfinder.height) / 2, // Center vertically
                     left: (SCREEN_WIDTH - cameraViewfinder.width) / 2, // Center horizontally
                     width: cameraViewfinder.width, // Actual viewfinder width
                     height: cameraViewfinder.height, // Actual viewfinder height
                     backgroundColor: 'red',
                     borderWidth: 4,
                     borderColor: 'white',
                     justifyContent: 'center',
                     alignItems: 'center',
                     borderRadius: 8,
                   }}>
                     <Text style={{ 
                       color: 'white', 
                       fontSize: 14,
                       textAlign: 'center',
                       fontWeight: 'bold'
                     }}>
                       {Math.round(cameraViewfinder.width)}×{Math.round(cameraViewfinder.height)}
                     </Text>
                     <Text style={{ 
                       color: 'rgba(255, 255, 255, 0.8)', 
                       fontSize: 12, 
                       marginTop: 5,
                       textAlign: 'center'
                     }}>
                       {cameraViewfinder.aspectRatio.toFixed(2)}
                     </Text>
                   </View>
                   */}

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: insets.top + 1,
                left: 20,
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../../assets/icons/x.png')}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: '#ffffff',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Template Carousel with integrated category selection */}
            <TemplateCarousel
              category={selectedCategory}
              onTemplateSelect={handleTemplateSelect}
              onCategoryChange={setSelectedCategory}
              selectedTemplateId={selectedTemplateId}
              cameraViewRef={cameraViewRef}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>
    </>
  )
}