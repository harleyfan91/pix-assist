import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { BlurView } from "@react-native-community/blur"
import { Ionicons } from "@expo/vector-icons"
import { GestureDetector } from "react-native-gesture-handler"
import Reanimated from "react-native-reanimated"
import { BlurButton } from "@/components/BlurButton"
import * as styles from "../../screens/CameraScreen.styles"

interface CameraControlsProps {
  // Navigation
  onNavigateToGallery: () => void
  
  // Shutter button
  shutterButtonGesture: any
  shutterPressed: boolean
  isCapturing: boolean
  
  // Camera mode controls
  animatedCameraModeStyle: any
  animatedCameraControlsOpacity: any
  animatedChevronStyle: any
  onToggleCameraModeExpansion: () => void
  
  // Flash controls
  onFlashToggle: () => void
  flashMode: 'auto' | 'on' | 'off'
  flashIconStyle: any
  
  // Exposure controls
  onToggleExposureControls: () => void
  exposureIconStyle: any
  
  // Crop controls
  cropIconStyle: any
  
  // Gallery button
  galleryIconStyle: any
}

export const CameraControls: React.FC<CameraControlsProps> = React.memo(({
  onNavigateToGallery,
  shutterButtonGesture,
  shutterPressed,
  isCapturing,
  animatedCameraModeStyle,
  animatedCameraControlsOpacity,
  animatedChevronStyle,
  onToggleCameraModeExpansion,
  onFlashToggle,
  flashMode,
  flashIconStyle,
  onToggleExposureControls,
  exposureIconStyle,
  cropIconStyle,
  galleryIconStyle,
}) => {
  return (
    <View style={styles.$bottomControls}>
      {/* Left Container: Gallery Button */}
      <View style={styles.$leftControlsContainer}>
        <BlurButton
          onPress={onNavigateToGallery}
          icon={Ionicons}
          iconProps={{
            name: "images-outline",
            size: 24,
            color: "#fff"
          }}
          style={styles.$galleryButton}
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
      <View style={styles.$centerControlsContainer}>
        <GestureDetector gesture={shutterButtonGesture}>
          <View style={[
            styles.$shutterButton,
            (shutterPressed || isCapturing) && { opacity: 0.6 }
          ]}>
            <View style={styles.$shutterButtonInner} />
          </View>
        </GestureDetector>
      </View>

      {/* Right Container: Camera Mode Button */}
      <View style={styles.$rightControlsContainer}>
        <Reanimated.View style={[animatedCameraModeStyle, styles.$cameraModeContainer]}>
          {/* Main expanding background with blur */}
          <BlurView
            style={styles.$cameraModeBlurBackground}
            blurType="light"
            blurAmount={7}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.2)"
          />
          
          {/* Camera control buttons - only visible when expanded */}
          <Reanimated.View style={[styles.$controlsContainer, animatedCameraControlsOpacity]}>
            <BlurButton
              onPress={onFlashToggle}
              style={styles.$controlButton}
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
              onPress={onToggleExposureControls}
              style={styles.$controlButton}
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
              style={styles.$controlButton}
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
            onPress={onToggleCameraModeExpansion}
            style={styles.$chevronButtonContainer}
            activeOpacity={0.6}
          >
            <Reanimated.View style={animatedChevronStyle}>
              <Ionicons name="chevron-up-sharp" size={24} color="#fff" />
            </Reanimated.View>
          </TouchableOpacity>
        </Reanimated.View>
      </View>
    </View>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  // Only re-render if primitive values change, skip animated styles
  return (
    prevProps.shutterPressed === nextProps.shutterPressed &&
    prevProps.isCapturing === nextProps.isCapturing &&
    prevProps.flashMode === nextProps.flashMode &&
    // Skip animated styles as they change frequently but don't affect functionality
    // The animated styles are handled by Reanimated and don't need re-renders
    prevProps.onNavigateToGallery === nextProps.onNavigateToGallery &&
    prevProps.onToggleCameraModeExpansion === nextProps.onToggleCameraModeExpansion &&
    prevProps.onFlashToggle === nextProps.onFlashToggle &&
    prevProps.onToggleExposureControls === nextProps.onToggleExposureControls
  )
})
