import { FC } from "react"
import { View, ViewStyle, Image, ImageStyle, TouchableOpacity, Alert, TextStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation"

type PreviewScreenRouteProp = RouteProp<AppStackParamList, "Preview">

export const PreviewScreen: FC = function PreviewScreen() {
  const navigation = useNavigation()
  const route = useRoute<PreviewScreenRouteProp>()
  const { photoPath } = route.params
  const deviceOrientation = useDeviceOrientation()

  // Get icon rotation angle based on device orientation
  const getIconRotation = () => {
    switch (deviceOrientation.orientation) {
      case 'landscape-left':
        return '90deg'  // Rotate 90° clockwise
      case 'landscape-right':
        return '-90deg' // Rotate 90° counter-clockwise
      case 'portrait-upside-down':
        return '180deg' // Rotate 180°
      case 'portrait':
      default:
        return '0deg'   // No rotation
    }
  }


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
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    )
  }

  const handleEditPhoto = () => {
    // TODO: Navigate to edit photo page
    Alert.alert(
      "Edit Photo",
      "Photo editing feature coming soon!",
      [{ text: "OK" }]
    )
  }


  return (
    <Screen preset="fixed" contentContainerStyle={$container}>

      {/* Photo Display */}
      <Image
        source={{ uri: photoPath }}
        style={[
          $photoImage,
          deviceOrientation.isLandscape ? $photoImageLandscape : $photoImagePortrait
        ]}
        resizeMode="contain"
      />

      {/* Action Buttons */}
      <View style={$actionsContainer}>
        <TouchableOpacity style={$actionButton} onPress={handleRetake}>
          <Ionicons 
            name="close-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: getIconRotation() }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleSave}>
          <Ionicons 
            name="download-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: getIconRotation() }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleEditPhoto}>
          <Ionicons 
            name="create-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: getIconRotation() }] }}
          />
        </TouchableOpacity>
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#000",
}


const $photoImage: ImageStyle = {
  flex: 1,
  width: "100%",
}

const $photoImagePortrait: ImageStyle = {
  // Portrait: use 80% of available space
  flex: 0.8,
  width: "80%",
  alignSelf: "center",
}

const $photoImageLandscape: ImageStyle = {
  // Landscape: use 80% of available space to account for rotation
  flex: 0.8,
  width: "80%",
  alignSelf: "center",
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
