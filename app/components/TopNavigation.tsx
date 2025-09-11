import React, { useState, useEffect } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, { 
  runOnJS, 
  useSharedValue, 
  useAnimatedStyle, 
  useDerivedValue,
  withSpring
} from "react-native-reanimated"
import { BlurView } from '@react-native-community/blur'
import { AppStackScreenProps } from "@/navigators/AppNavigator"

interface TopNavigationProps {
  onNavigationStateChange?: (isOpen: boolean) => void
  onProgressChange?: (progress: number) => void
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onNavigationStateChange, onProgressChange }) => {
  const navigation = useNavigation<AppStackScreenProps<"Camera">["navigation"]>()
  const insets = useSafeAreaInsets()
  const [isOpen, setIsOpen] = useState(false)

  // Single source of truth - just the height
  const height = useSharedValue(80)

  // Sync height with isOpen state
  useEffect(() => {
    height.value = withSpring(isOpen ? 160 : 80, { damping: 20, stiffness: 300 })
    onNavigationStateChange?.(isOpen)
  }, [isOpen])

  // REVERSIBLE ANIMATION: Notify parent of progress using useDerivedValue (COMMENTED OUT)
  // useDerivedValue(() => {
  //   const progress = (height.value - 80) / 80
  //   if (onProgressChange) {
  //     runOnJS(onProgressChange)(progress)
  //   }
  // })

  const handleNavigation = (screenName: "Home" | "Gallery" | "Settings" | "Templates") => {
    navigation.navigate(screenName as any)
    setIsOpen(false)
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen)
  }

  // Simple gesture - just toggle on swipe
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      'worklet'
      const { translationY, velocityY } = event
      
      // Simple logic: swipe down to open, swipe up to close
      if (translationY > 20 || velocityY > 500) {
        runOnJS(setIsOpen)(true)
      } else if (translationY < -20 || velocityY < -500) {
        runOnJS(setIsOpen)(false)
      }
    })

  // Simple animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  const iconsOpacity = useAnimatedStyle(() => ({
    opacity: isOpen ? 1 : 0,
  }))

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity 
          style={$overlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
      
      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[$drawer, { paddingTop: insets.top + 4 }, animatedStyle]}>
          {/* Blur background layer - only visible when expanded */}
          {isOpen && (
            <BlurView
              style={$blurBackground}
              blurType="extraDark"
              blurAmount={15}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.95)"
            />
          )}
          
          {/* Icons */}
          <Reanimated.View style={[iconsOpacity]}>
            <View style={$iconsContainer}>
              <TouchableOpacity style={$iconButton} onPress={() => handleNavigation("Home")}>
                <Ionicons 
                  name="home-outline" 
                  size={24} 
                  color="#fff" 
                  style={{}}
                />
              </TouchableOpacity>
              <TouchableOpacity style={$iconButton} onPress={() => handleNavigation("Templates")}>
                <Ionicons 
                  name="grid-outline" 
                  size={24} 
                  color="#fff" 
                  style={{}}
                />
              </TouchableOpacity>
              <TouchableOpacity style={$iconButton} onPress={() => handleNavigation("Settings")}>
                <Ionicons 
                  name="settings-outline" 
                  size={24} 
                  color="#fff" 
                  style={{}}
                />
              </TouchableOpacity>
            </View>
          </Reanimated.View>

          {/* Handle */}
          <TouchableOpacity style={$handle} onPress={toggleDrawer}>
            <View style={$handleBar} />
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </>
  )
}

// Simple styles
const $overlay: ViewStyle = {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "transparent",
  zIndex: 999,
}

const $drawer: ViewStyle = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  backgroundColor: "transparent",
  // REVERSIBLE ANIMATION: Rounded corners removed for straight edge alignment
  // borderBottomLeftRadius: 20,
  // borderBottomRightRadius: 20,
  paddingHorizontal: 20,
  paddingBottom: 4,
  zIndex: 1000,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

const $iconsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingTop: 12,
  paddingBottom: 12,
}

const $iconButton: ViewStyle = {
  padding: 12,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 60,
}

const $handle: ViewStyle = {
  position: "absolute",
  bottom: 0, left: 0, right: 0,
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
}

const $handleBar: ViewStyle = {
  width: 36,
  height: 4,
  backgroundColor: "#fff",
  borderRadius: 2,
}

const $blurBackground: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  // REVERSIBLE ANIMATION: Rounded corners removed for straight edge alignment
  // borderBottomLeftRadius: 20,
  // borderBottomRightRadius: 20,
}


