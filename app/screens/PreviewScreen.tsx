import { FC } from "react"
import { View, ViewStyle, Image, ImageStyle, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackParamList } from "@/navigators/AppNavigator"

type PreviewScreenRouteProp = RouteProp<AppStackParamList, "Preview">

export const PreviewScreen: FC = function PreviewScreen() {
  const navigation = useNavigation()
  const route = useRoute<PreviewScreenRouteProp>()
  const { photoPath } = route.params

  const handleSave = () => {
    // Photo is already saved, just show confirmation
    Alert.alert(
      "Photo Saved",
      "Your photo has been saved to your gallery.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    )
  }

  const handleRetake = () => {
    Alert.alert(
      "Retake Photo",
      "Are you sure you want to retake this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Retake", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    )
  }

  const handleGallery = () => {
    navigation.navigate("Gallery")
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      {/* Header */}
      <View style={$header}>
        <TouchableOpacity onPress={handleBack} style={$backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text preset="heading" text="Preview" style={$headerTitle} />
        <View style={$headerSpacer} />
      </View>

      {/* Photo Display */}
      <View style={$photoContainer}>
        <Image 
          source={{ uri: photoPath }} 
          style={$photoImage}
          resizeMode="contain"
        />
      </View>

      {/* Action Buttons */}
      <View style={$actionsContainer}>
        <TouchableOpacity style={$actionButton} onPress={handleRetake}>
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleSave}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleGallery}>
          <Ionicons name="images-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#000",
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 10,
}

const $backButton: ViewStyle = {
  padding: 8,
}

const $headerTitle: ViewStyle = {
  color: "#fff",
  fontSize: 18,
  fontWeight: "600",
}

const $headerSpacer: ViewStyle = {
  width: 40, // Same width as back button to center title
}

const $photoContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

const $photoImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $actionsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingHorizontal: 20,
  paddingVertical: 30,
  paddingBottom: 40,
}

const $actionButton: ViewStyle = {
  padding: 12,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 60,
}
