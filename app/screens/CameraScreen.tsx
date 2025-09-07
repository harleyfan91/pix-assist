import { FC, useCallback, useEffect, useState } from "react"
import { Alert, Linking, TouchableOpacity, View, ViewStyle, StyleSheet } from "react-native"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Button, ButtonText, Text as GluestackText } from "@gluestack-ui/themed"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { spacing } from "@/theme/spacing"

export const CameraScreen: FC = function CameraScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState(false)

  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice("back")

  useEffect(() => {
    setCameraPermission(hasPermission)
  }, [hasPermission])

  const promptForCameraPermissions = useCallback(async () => {
    if (hasPermission) return
    const permission = await requestPermission()
    setCameraPermission(permission)

    if (!permission) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to take photos. Please enable it in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }, [hasPermission, requestPermission])

  const { right, top } = useSafeAreaInsets()

  if (cameraPermission == null) {
    // still loading
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 Loading Camera..." />
        </View>
      </Screen>
    )
  }

  if (!cameraPermission) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 Camera Permission Required" />
          <Text preset="subheading" text="Please grant camera permission to use this feature." />
          <Button onPress={promptForCameraPermissions} variant="solid" size="lg">
            <ButtonText>Request Camera Permission</ButtonText>
          </Button>
        </View>
      </Screen>
    )
  }

  if (!device) {
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 No Camera Found" />
          <Text preset="subheading" text="No camera device available on this device." />
        </View>
      </Screen>
    )
  }

  return (
    <View style={$cameraContainer}>
      <Camera
        isActive={isActive}
        device={device}
        style={StyleSheet.absoluteFill}
        photo
        video
      />
      <View style={[$cameraButtons, { right: right + spacing.md, top: top + spacing.md }]}>
        <TouchableOpacity
          style={$closeCamera}
          onPress={() => setIsActive(!isActive)}
        >
          <GluestackText color="$white" size="2xl">
            {isActive ? "⏸️" : "▶️"}
          </GluestackText>
        </TouchableOpacity>
      </View>
      <View style={$bottomControls}>
        <Button
          onPress={() => setIsActive(!isActive)}
          variant="solid"
          size="lg"
        >
          <ButtonText>
            {isActive ? "Pause Camera" : "Start Camera"}
          </ButtonText>
        </Button>
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

const $cameraContainer: ViewStyle = {
  flex: 1,
}

const $cameraButtons: ViewStyle = {
  position: "absolute",
}

const $closeCamera: ViewStyle = {
  marginBottom: spacing.md,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "rgba(140, 140, 140, 0.3)",
  justifyContent: "center",
  alignItems: "center",
}

const $bottomControls: ViewStyle = {
  position: "absolute",
  bottom: 50,
  left: 0,
  right: 0,
  alignItems: "center",
}
