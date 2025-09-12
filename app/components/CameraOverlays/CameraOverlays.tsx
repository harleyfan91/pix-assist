import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { BlurView } from "@react-native-community/blur"
import { Ionicons } from "@expo/vector-icons"
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@gluestack-ui/themed"
import Reanimated from "react-native-reanimated"
import { BlurButton } from "@/components/BlurButton"
import { Text } from "@/components/Text"
import * as styles from "../../screens/CameraScreen.styles"

interface CameraOverlaysProps {
  // Flash overlay
  animatedFlashStyle: any
  
  // Focus ring
  showFocusRing: boolean
  animatedFocusRingStyle: any
  
  // Popup indicator
  popupState: {
    visible: boolean
    value: string
  }
  animatedPopupStyle: any
  popupTextStyle: any
  
  // Exposure controls
  isExposureControlsVisible: boolean
  animatedExposureControlsStyle: any
  exposureLabelStyle: any
  sliderValue: number
  handleExposureSliderChange: (value: number) => void
}

export const CameraOverlays: React.FC<CameraOverlaysProps> = ({
  animatedFlashStyle,
  showFocusRing,
  animatedFocusRingStyle,
  popupState,
  animatedPopupStyle,
  popupTextStyle,
  isExposureControlsVisible,
  animatedExposureControlsStyle,
  exposureLabelStyle,
  sliderValue,
  handleExposureSliderChange,
}) => {
  return (
    <>
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
    </>
  )
}
