import React, { useState } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { runOnJS } from "react-native-reanimated"
import { AppStackScreenProps } from "@/navigators/AppNavigator"

export const TopNavigation: React.FC = () => {
  const navigation = useNavigation<AppStackScreenProps<"Camera">["navigation"]>()
  const insets = useSafeAreaInsets()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (screenName: keyof AppStackScreenProps<"Camera">["navigation"]["navigate"]) => {
    navigation.navigate(screenName as any)
    setIsOpen(false) // Close navigation after selection
  }

  // Pan gesture for swipe up/down
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      'worklet'
      const { translationY, velocityY } = event
      
      // Swipe down to open (when closed)
      if (!isOpen && translationY > 20 && velocityY > 500) {
        runOnJS(setIsOpen)(true)
      }
      // Swipe up to close (when open)
      else if (isOpen && translationY < -20 && velocityY < -500) {
        runOnJS(setIsOpen)(false)
      }
    })

  if (!isOpen) {
    // Show just the handle when closed
    return (
      <GestureDetector gesture={panGesture}>
        <View style={[$topHandle, { paddingTop: insets.top + 6 }]}>
          <TouchableOpacity style={$handleButton} onPress={() => setIsOpen(true)}>
            <View style={$handleBar} />
          </TouchableOpacity>
        </View>
      </GestureDetector>
    )
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[$topNavigation, { paddingTop: insets.top + 10 }]}>
        {/* Handle */}
        <TouchableOpacity style={$handleButton} onPress={() => setIsOpen(false)}>
          <View style={$handleBar} />
        </TouchableOpacity>

        {/* Navigation Icons */}
        <View style={$navigationIcons}>
          <TouchableOpacity 
            style={$navButton} 
            onPress={() => handleNavigation("Home")}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={$navButton} 
            onPress={() => handleNavigation("Gallery")}
          >
            <Ionicons name="images" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={$navButton} 
            onPress={() => handleNavigation("Settings")}
          >
            <Ionicons name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </GestureDetector>
  )
}

// Styles
const $topNavigation: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  paddingHorizontal: 20,
  paddingBottom: 15,
  zIndex: 1000,
}

const $topHandle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  paddingBottom: 8,
  alignItems: "center",
  zIndex: 1000,
}

const $handleButton: ViewStyle = {
  paddingVertical: 4,
  paddingHorizontal: 20,
  alignItems: "center",
}

const $handleBar: ViewStyle = {
  width: 32,
  height: 3,
  backgroundColor: "#fff",
  borderRadius: 2,
}

const $navigationIcons: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingTop: 16,
}

const $navButton: ViewStyle = {
  padding: 12,
  borderRadius: 20,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 60,
}
