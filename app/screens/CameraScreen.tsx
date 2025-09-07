import { FC, useCallback, useEffect, useState, useRef } from "react"
import {
  Alert,
  Linking,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native"
import { Button, ButtonText } from "@gluestack-ui/themed"
import { PinchGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"

export const CameraScreen: FC = function CameraScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [isActive] = useState(true) // Always on by default
  const [zoom, setZoom] = useState(1)

  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice("back")
  const cameraRef = useRef<Camera>(null)

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
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      )
    }
  }, [hasPermission, requestPermission])

  const takePhoto = useCallback(() => {
    console.log("Taking photo...")
    // TODO: Implement photo capture
  }, [])

  const handlePinchZoom = useCallback(
    (event: any) => {
      if (!device) return

      const { scale, state } = event.nativeEvent

      if (state === State.ACTIVE) {
        // Use device-specific zoom limits
        const minZoom = device.minZoom ?? 0.5
        const maxZoom = device.maxZoom ?? 10

        // Apply logarithmic scaling for natural feel
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * Math.pow(scale, 0.8)))
        setZoom(newZoom)
      }
    },
    [device, zoom],
  )

  const { right: _right, top: _top } = useSafeAreaInsets()

  if (cameraPermission == null) {
    // still loading
    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <View style={$content}>
          <Text preset="heading" text="📷 TESTING RELOAD..." />
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
    <GestureHandlerRootView style={$cameraContainer}>
      <PinchGestureHandler onHandlerStateChange={handlePinchZoom} onGestureEvent={handlePinchZoom}>
        <View style={StyleSheet.absoluteFill}>
          <Camera
            ref={cameraRef}
            isActive={isActive}
            device={device}
            style={StyleSheet.absoluteFill}
            photo
            video
            zoom={zoom}
          />

          {/* Zoom Indicator */}
          {zoom !== 1 && (
            <View style={$zoomIndicator}>
              <Text style={$zoomText}>{zoom.toFixed(1)}x</Text>
            </View>
          )}
        </View>
      </PinchGestureHandler>

      {/* Shutter Button */}
      <View style={$bottomControls}>
        <TouchableOpacity style={$shutterButton} onPress={takePhoto}>
          <View style={$shutterButtonInner} />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
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

const $bottomControls: ViewStyle = {
  position: "absolute",
  bottom: 50,
  left: 0,
  right: 0,
  alignItems: "center",
}

const $shutterButton: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderWidth: 4,
  borderColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
}

const $shutterButtonInner: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#fff",
}

const $zoomIndicator: ViewStyle = {
  position: "absolute",
  top: 60,
  left: 20,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
}

const $zoomText: TextStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
}
