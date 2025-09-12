import React, { FC } from "react"
import { View, StyleSheet, StatusBar, Text as RNText } from "react-native"
import { AppStackScreenProps } from "@/navigators/AppNavigator"

export const CameraScreen: FC<AppStackScreenProps<"Camera">> = function CameraScreen({ route }) {
  const { onTemplateDrawerToggle } = route.params || {}
  
  // TEST: Using native Text to see if custom Text component is the problem
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Content positioned manually with NATIVE Text */}
      <View style={styles.content}>
        <RNText style={styles.title}>
          📱 NATIVE TEXT TEST
        </RNText>
        <RNText style={styles.subtitle}>
          • Using React Native Text directly
        </RNText>
        <RNText style={styles.subtitle}>
          • No custom Text component
        </RNText>
        <RNText style={styles.subtitle}>
          • No theme/useAppTheme dependency
        </RNText>
        <RNText style={styles.subtitle}>
          • Should not be cut off
        </RNText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Full screen black
  },
  content: {
    position: 'absolute',
    top: 100, // Fixed position - no safe area math
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
})