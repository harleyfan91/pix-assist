import { FC } from "react"
import { View, ViewStyle, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackParamList } from "@/navigators/AppNavigator"

type RetouchScreenRouteProp = RouteProp<AppStackParamList, "Retouch">

export const RetouchScreen: FC = function RetouchScreen() {
  const navigation = useNavigation()
  const route = useRoute<RetouchScreenRouteProp>()
  const { originalUri, processedUri, displayUri, tempFiles } = route.params

  const handleBack = () => {
    navigation.goBack()
  }

  const handleSave = () => {
    Alert.alert(
      "Save Changes",
      "Retouch functionality coming soon!",
      [{ text: "OK" }]
    )
  }

  const handleDiscard = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Discard", 
          style: "destructive",
          onPress: () => navigation.goBack()
        }
      ]
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      
      {/* Header */}
      <View style={$header}>
        <TouchableOpacity style={$backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={$title}>Retouch Photo</Text>
        <View style={$placeholder} />
      </View>

      {/* Main Content */}
      <View style={$content}>
        <View style={$placeholderImage}>
          <Ionicons name="image-outline" size={80} color="#666" />
          <Text style={$placeholderText}>Photo Retouching</Text>
          <Text style={$comingSoonText}>Coming Soon!</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={$actionsContainer}>
        <TouchableOpacity style={$actionButton} onPress={handleDiscard}>
          <Ionicons name="close-outline" size={24} color="#fff" />
          <Text style={$buttonText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={handleSave}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
          <Text style={$buttonText}>Save</Text>
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
  paddingTop: 60,
  paddingBottom: 20,
}

const $backButton: ViewStyle = {
  padding: 8,
}

const $title: ViewStyle = {
  fontSize: 18,
  fontWeight: "600",
  color: "#fff",
}

const $placeholder: ViewStyle = {
  width: 40,
}

const $content: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 40,
}

const $placeholderImage: ViewStyle = {
  alignItems: "center",
  paddingVertical: 60,
}

const $placeholderText: ViewStyle = {
  fontSize: 24,
  fontWeight: "600",
  color: "#fff",
  marginTop: 20,
  marginBottom: 10,
}

const $comingSoonText: ViewStyle = {
  fontSize: 16,
  color: "#666",
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
  alignItems: "center",
  padding: 16,
  minWidth: 80,
}

const $buttonText: ViewStyle = {
  color: "#fff",
  fontSize: 14,
  marginTop: 4,
}
