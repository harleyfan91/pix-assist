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
import * as styles from "./TopNavigation.styles"

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
    height.value = withSpring(isOpen ? 150 : 80, { damping: 20, stiffness: 300 })
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

  // Draggable gesture - follows finger in real-time
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet'
      const { translationY } = event
      
      // Real-time height tracking - follows finger with resistance at boundaries
      const baseHeight = isOpen ? 150 : 80
      let newHeight = baseHeight + translationY
      
      // Add resistance at boundaries for natural feel
      if (newHeight < 80) {
        newHeight = 80 + (newHeight - 80) * 0.3 // Resistance when pulling down
      } else if (newHeight > 150) {
        newHeight = 150 + (newHeight - 150) * 0.3 // Resistance when pulling up
      }
      
      height.value = Math.max(60, Math.min(180, newHeight)) // Allow slight overshoot
    })
    .onEnd((event) => {
      'worklet'
      const { translationY, velocityY } = event
      
      // Determine final state based on position and velocity
      const currentHeight = height.value
      const shouldOpen = currentHeight > 115 || velocityY > 500
      const shouldClose = currentHeight < 115 || velocityY < -500
      
      if (shouldOpen) {
        height.value = withSpring(150, { damping: 20, stiffness: 300 })
        runOnJS(setIsOpen)(true)
      } else if (shouldClose) {
        height.value = withSpring(80, { damping: 20, stiffness: 300 })
        runOnJS(setIsOpen)(false)
      } else {
        // Snap back to current state
        const targetHeight = isOpen ? 150 : 80
        height.value = withSpring(targetHeight, { damping: 20, stiffness: 300 })
      }
    })

  // Smooth animated styles that follow finger
  const animatedStyle = useAnimatedStyle(() => {
    // Smooth border radius transition based on height
    const progress = (height.value - 80) / 70 // 0-1 range
    const borderRadius = progress * 20 // 0-20 range
    
    return {
      height: height.value,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    }
  })

  const iconsOpacity = useAnimatedStyle(() => {
    // Smooth opacity transition based on height (80-150 range)
    const progress = (height.value - 80) / 70 // 0-1 range
    return {
      opacity: Math.max(0, Math.min(1, progress)),
    }
  })

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity 
          style={styles.$overlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
      
      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.$drawer, { paddingTop: insets.top + 4 }, animatedStyle]}>
          {/* Blur background layer - only visible when expanded */}
          {isOpen && (
            <BlurView
              style={[styles.$blurBackground, { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}
              blurType="extraDark"
              blurAmount={15}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.95)"
            />
          )}
          
          {/* Icons */}
          <Reanimated.View style={[iconsOpacity]}>
            <View style={styles.$iconsContainer}>
              <TouchableOpacity style={styles.$iconButton} onPress={() => handleNavigation("Home")}>
                <Ionicons 
                  name="home-outline" 
                  size={24} 
                  color="#fff" 
                  style={{}}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.$iconButton} onPress={() => handleNavigation("Templates")}>
                <Ionicons 
                  name="grid-outline" 
                  size={24} 
                  color="#fff" 
                  style={{}}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.$iconButton} onPress={() => handleNavigation("Settings")}>
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
          <TouchableOpacity style={styles.$handle} onPress={toggleDrawer}>
            <View style={styles.$handleBar} />
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </>
  )
}



