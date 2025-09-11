import React from "react"
import { View, ViewStyle, StyleProp, TouchableOpacity, GestureResponderEvent } from "react-native"
import { BlurView } from "@react-native-community/blur"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated"

export interface BlurButtonProps {
  /**
   * Function to call when button is pressed
   */
  onPress?: (event: GestureResponderEvent) => void
  /**
   * Icon component to render (e.g., Ionicons)
   */
  icon?: React.ComponentType<any>
  /**
   * Icon name/props to pass to the icon component
   */
  iconProps?: any
  /**
   * Custom content to render instead of icon
   */
  children?: React.ReactNode
  /**
   * Button style
   */
  style?: StyleProp<ViewStyle>
  /**
   * Blur type - "light", "dark", or "xlight"
   */
  blurType?: "light" | "dark" | "xlight"
  /**
   * Blur intensity (0-100)
   */
  blurAmount?: number
  /**
   * Fallback color for devices that don't support blur
   */
  reducedTransparencyFallbackColor?: string
  /**
   * Whether the button is currently pressed
   */
  pressed?: boolean
  /**
   * Press animation duration
   */
  pressAnimationDuration?: number
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Test ID for testing
   */
  testID?: string
}

export const BlurButton: React.FC<BlurButtonProps> = ({
  onPress,
  icon: IconComponent,
  iconProps = {},
  children,
  style,
  blurType = "light",
  blurAmount = 7,
  reducedTransparencyFallbackColor = "rgba(255, 255, 255, 0.2)",
  pressed = false,
  pressAnimationDuration = 100,
  disabled = false,
  testID,
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  // Animated style for press effects
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  // Gesture handling
  const gesture = Gesture.Tap()
    .onBegin(() => {
      'worklet'
      if (!disabled) {
        scale.value = withTiming(0.95, { duration: pressAnimationDuration })
        opacity.value = withTiming(0.6, { duration: pressAnimationDuration })
      }
    })
    .onEnd(() => {
      'worklet'
      if (!disabled && onPress) {
        runOnJS(onPress)({} as GestureResponderEvent)
      }
    })
    .onFinalize(() => {
      'worklet'
      if (!disabled) {
        scale.value = withTiming(1, { duration: pressAnimationDuration })
        opacity.value = withTiming(1, { duration: pressAnimationDuration })
      }
    })

  const buttonStyle: ViewStyle = {
    position: "relative",
    overflow: "hidden",
    ...(style as ViewStyle),
  }

  const blurStyle: ViewStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: (style as ViewStyle)?.borderRadius || 0,
  }

  const contentStyle: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  }

  return (
    <GestureDetector gesture={gesture}>
      <Reanimated.View style={[buttonStyle, animatedStyle]} testID={testID}>
        <BlurView
          style={blurStyle}
          blurType={blurType}
          blurAmount={blurAmount}
          reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        />
        <View style={contentStyle}>
          {children || (IconComponent && <IconComponent {...iconProps} />)}
        </View>
      </Reanimated.View>
    </GestureDetector>
  )
}
