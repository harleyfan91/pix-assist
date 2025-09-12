import React, { FC } from "react"
import { View, StyleSheet, StatusBar } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Text } from "@/components/Text"
import { TopNavigation } from "@/components/TopNavigation"
import { AppStackScreenProps } from "@/navigators/AppNavigator"

export const CameraScreen: FC<AppStackScreenProps<"Camera">> = function CameraScreen({ route }) {
  const { onTemplateDrawerToggle } = route.params || {}
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      {/* Hide status bar for fullscreen camera experience */}
      <StatusBar hidden={true} />
      
      {/* Top Navigation with proper safe area */}
      <TopNavigation />
      
      {/* Camera Content Area */}
      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <Text size="lg" style={styles.cameraText}>
          📷 CAMERA READY
        </Text>
        <Text size="sm" style={styles.subText}>
          Text component fixed ✅
        </Text>
        <Text size="sm" style={styles.subText}>
          Safe areas handled properly ✅
        </Text>
        <Text size="sm" style={styles.subText}>
          Ready for camera implementation
        </Text>
      </View>
      
      {/* Bottom safe area for controls */}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom }]}>
        <Text size="xs" style={styles.controlsText}>
          Camera controls will go here
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Full screen camera background
    borderWidth: 4,
    borderColor: '#FF0000', // RED: Main container border
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 4,
    borderColor: '#00FF00', // GREEN: Main content area
    backgroundColor: '#003300', // DARK GREEN: Opaque background
  },
  cameraText: {
    color: '#000000', // Black text for contrast
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    backgroundColor: '#FFFF00', // BRIGHT YELLOW: Opaque
    padding: 8,
    borderWidth: 2,
    borderColor: '#FF8800', // Orange border
  },
  subText: {
    color: '#000000', // Black text for contrast
    textAlign: 'center',
    marginBottom: 8,
    backgroundColor: '#00FFFF', // BRIGHT CYAN: Opaque
    padding: 4,
    borderWidth: 2,
    borderColor: '#0088AA', // Dark cyan border
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
    borderWidth: 4,
    borderColor: '#0000FF', // BLUE: Bottom controls area
    backgroundColor: '#000066', // DARK BLUE: Opaque background
  },
  controlsText: {
    color: '#000000', // Black text for contrast
    textAlign: 'center',
    backgroundColor: '#FF00FF', // BRIGHT MAGENTA: Opaque
    padding: 8,
    borderWidth: 2,
    borderColor: '#AA0088', // Dark magenta border
  },
})