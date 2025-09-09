import { FC, useState, useEffect, useCallback } from "react"
import { View, ViewStyle, TouchableOpacity, Alert, Image, ImageStyle, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation"
import { photoLibraryService } from "@/services/photoLibrary"

type PreviewScreenRouteProp = RouteProp<AppStackParamList, "Preview">

export const PreviewScreen: FC = function PreviewScreen() {
  const navigation = useNavigation()
  const route = useRoute<PreviewScreenRouteProp>()
  const { photoPath } = route.params
  const deviceOrientation = useDeviceOrientation()

  // State management for file handling
  const [originalUri, setOriginalUri] = useState<string>(photoPath)
  const [processedUri, setProcessedUri] = useState<string>()
  const [displayUri, setDisplayUri] = useState<string>()
  const [filesToCleanup, setFilesToCleanup] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Smart caching system
  const [processedImages, setProcessedImages] = useState<Record<number, string>>({})
  const [currentRotationAngle, setCurrentRotationAngle] = useState<number | null>(null)
  
  // Remove animation state - keep it simple

  // Get rotation angle based on device orientation (memoized for performance)
  const getRotationAngle = useCallback(() => {
    if (deviceOrientation.orientation === 'landscape-left') return 90
    if (deviceOrientation.orientation === 'landscape-right') return -90
    if (deviceOrientation.orientation === 'portrait-upside-down') return 180
    return 0 // portrait
  }, [deviceOrientation.orientation])

  // Remove animation function - keep it simple

  // Smart processing function with caching
  const processImageForOrientation = async (originalUri: string, rotationAngle: number) => {
    // Check if we already have this rotation cached
    if (processedImages[rotationAngle]) {
      console.log(`Using cached image for rotation ${rotationAngle}°`)
      return processedImages[rotationAngle]
    }
    
    // Only process if we don't have this rotation cached
    console.log(`Processing new image for rotation ${rotationAngle}°`)
    setIsProcessing(true)
    try {
      if (rotationAngle === 0) {
        // Cache the original image for rotation 0°
        setProcessedImages(prev => ({
          ...prev,
          [0]: originalUri
        }))
        return originalUri // No processing needed
      }
      
      const result = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ rotate: rotationAngle }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      )
      
      // Cache the result
      setProcessedImages(prev => ({
        ...prev,
        [rotationAngle]: result.uri
      }))
      
      // Track processed file for cleanup
      setFilesToCleanup(prev => [...prev, result.uri])
      setProcessedUri(result.uri)
      return result.uri
    } catch (error) {
      console.error('Error processing image:', error)
      return originalUri
    } finally {
      setIsProcessing(false)
    }
  }

  // Smart initialization with immediate display (no animations)
  useEffect(() => {
    if (originalUri) {
      const rotationAngle = getRotationAngle()
      
      // Only process if rotation angle actually changed
      if (currentRotationAngle !== rotationAngle) {
        console.log(`Rotation angle changed from ${currentRotationAngle}° to ${rotationAngle}°`)
        setCurrentRotationAngle(rotationAngle)
        
        // Check if we have this rotation cached for instant display
        if (processedImages[rotationAngle]) {
          console.log(`Instantly showing cached image for rotation ${rotationAngle}°`)
          setDisplayUri(processedImages[rotationAngle])
        } else {
          // Show original image immediately, then process in background
          console.log(`Showing original image immediately, processing ${rotationAngle}° in background`)
          setDisplayUri(originalUri)
          
          // Process image in background and update when ready
          processImageForOrientation(originalUri, rotationAngle)
            .then(setDisplayUri)
            .catch(console.error)
        }
      }
    }
  }, [originalUri, deviceOrientation.orientation, processedImages])

  // Cleanup files on unmount
  useEffect(() => {
    return () => {
      // Clean up any temporary files when component unmounts
      const allFilesToCleanup = [
        ...filesToCleanup,
        ...Object.values(processedImages)
      ]
      
      allFilesToCleanup.forEach(async (fileUri) => {
        try {
          if (fileUri && fileUri !== originalUri) {
            // Check if file exists before trying to delete
            const fileInfo = await FileSystem.getInfoAsync(fileUri)
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(fileUri)
            }
          }
        } catch (error) {
          // Silently ignore cleanup errors - files may already be cleaned up by system
          console.log('File cleanup skipped (file may not exist):', fileUri)
        }
      })
    }
  }, []) // Remove dependencies to prevent multiple cleanup attempts

  const discardPhoto = async () => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // Delete original file (with proper path validation)
              if (originalUri) {
                console.log('Attempting to delete original file:', originalUri)
                try {
                  const fileInfo = await FileSystem.getInfoAsync(originalUri)
                  console.log('Original file info:', fileInfo)
                  if (fileInfo.exists) {
                    await FileSystem.deleteAsync(originalUri)
                    console.log('Original file deleted successfully')
                  } else {
                    console.log('Original file does not exist, skipping deletion')
                  }
                } catch (error) {
                  console.log('Error deleting original file (may not exist):', error instanceof Error ? error.message : String(error))
                }
              }
              
              // Delete any processed files
              for (const fileUri of filesToCleanup) {
                try {
                  const fileInfo = await FileSystem.getInfoAsync(fileUri)
                  if (fileInfo.exists) {
                    await FileSystem.deleteAsync(fileUri)
                  }
                } catch (error) {
                  console.log('File cleanup skipped (file may not exist):', fileUri)
                }
              }
              
              // Delete cached images
              for (const fileUri of Object.values(processedImages)) {
                if (fileUri && fileUri !== originalUri) {
                  try {
                    const fileInfo = await FileSystem.getInfoAsync(fileUri)
                    if (fileInfo.exists) {
                      await FileSystem.deleteAsync(fileUri)
                    }
                  } catch (error) {
                    console.log('File cleanup skipped (file may not exist):', fileUri)
                  }
                }
              }
              
              // Navigate back to camera (even if some files couldn't be deleted)
              console.log('Photo discard completed, navigating back to camera')
              navigation.goBack()
            } catch (error) {
              console.error('Error during discard operation:', error)
              // Still navigate back even if cleanup failed
              console.log('Cleanup had issues, but navigating back anyway')
              navigation.goBack()
            }
          }
        }
      ]
    )
  }

  const savePhoto = async () => {
    try {
      // Save the currently displayed version
      const finalUri = displayUri || originalUri
      const success = await photoLibraryService.savePhoto(finalUri)
      
      if (success) {
        // Clean up temporary processed file if different from original
        if (processedUri && processedUri !== originalUri) {
          await FileSystem.deleteAsync(processedUri)
        }
        
        Alert.alert(
          "Photo Saved",
          "Your photo has been saved to your gallery.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        )
      } else {
        Alert.alert("Error", "Failed to save photo. Please try again.")
      }
    } catch (error) {
      console.error('Error saving photo:', error)
      Alert.alert("Error", "Failed to save photo. Please try again.")
    }
  }

  const goToRetouch = () => {
    // Navigate to RetouchScreen with all the file information
    (navigation as any).navigate('Retouch', {
      originalUri: originalUri,
      processedUri: processedUri,
      displayUri: displayUri,
      tempFiles: filesToCleanup
    })
  }


  return (
    <Screen preset="fixed" contentContainerStyle={$container}>

      {/* Photo Display */}
      <View style={$photoContainer}>
        {displayUri && (
          <Image
            source={{ uri: displayUri }}
            style={$photoImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Fixed Loading Indicator - Center Screen */}
      {isProcessing && (
        <View style={$loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {/* Action Buttons */}
      <View style={$actionsContainer}>
        <TouchableOpacity style={$actionButton} onPress={discardPhoto}>
          <Ionicons 
            name="close-outline" 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={savePhoto}>
          <Ionicons 
            name="download-outline" 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity style={$actionButton} onPress={goToRetouch}>
          <Ionicons 
            name="color-wand-outline" 
            size={24} 
            color="#fff" 
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

const $photoContainer: ViewStyle = {
  width: "90%",
  height: "70%",
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center',
}

const $photoImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $loadingOverlay: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
}


const $actionsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 100,
  paddingBottom: 40,
}

const $actionButton: ViewStyle = {
  padding: 12,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 60,
}
