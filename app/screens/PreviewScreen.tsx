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
    (navigation as any).navigate("Gallery")
  }


  return (
    <Screen preset="fixed" contentContainerStyle={$container}>

      {/* Photo Display */}
      <Image
        source={{ uri: photoPath }}
        style={[
          $photoImage,
          deviceOrientation.isLandscape ? $photoImageLandscape : $photoImagePortrait,
          { transform: [{ rotate: deviceOrientation.isLandscape ? '90deg' : '0deg' }] }
        ]}
        resizeMode="contain"
      />

      {/* Action Buttons */}
      <View style={$actionsContainer}>
        <TouchableOpacity style={$actionButton} onPress={handleRetake}>
          <Ionicons 
            name="camera-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: deviceOrientation.isLandscape ? '90deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleSave}>
          <Ionicons 
            name="checkmark-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: deviceOrientation.isLandscape ? '90deg' : '0deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleGallery}>
          <Ionicons 
            name="images-outline" 
            size={24} 
            color="#fff" 
            style={{ transform: [{ rotate: deviceOrientation.isLandscape ? '90deg' : '0deg' }] }}
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
