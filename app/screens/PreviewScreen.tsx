import { FC, useState, useEffect, useCallback } from "react"
// import { FC, useState, useEffect, useCallback, useRef } from "react"
import { View, ViewStyle, TouchableOpacity, Alert, Image, ImageStyle, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
// import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view"
import { SnapbackZoom } from "react-native-zoom-toolkit"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import * as FileSystem from 'expo-file-system'

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { photoLibraryService } from "@/services/photoLibrary"
import { log } from '@/services/logging'

type PreviewScreenRouteProp = RouteProp<AppStackParamList, "Preview">

export const PreviewScreen: FC = function PreviewScreen() {
  const navigation = useNavigation()
  const route = useRoute<PreviewScreenRouteProp>()
  const { photoPath } = route.params

  // State management for file handling
  const [originalUri, setOriginalUri] = useState<string>(photoPath)
  const [processedUri, setProcessedUri] = useState<string>()
  const [displayUri, setDisplayUri] = useState<string>()
  const [filesToCleanup, setFilesToCleanup] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  
  // Simple ref for zoom control
  // const zoomRef = useRef<any>(null)



  // Remove animation function - keep it simple


  // Simple initialization - just show the original image
  useEffect(() => {
    if (originalUri) {
      log.gallery('Setting display URI', { originalUri })
      setDisplayUri(originalUri)
    }
  }, [originalUri])

  // Cleanup files on unmount
  useEffect(() => {
    return () => {
      // Clean up any temporary files when component unmounts
      const allFilesToCleanup = filesToCleanup
      
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
          log.gallery('File cleanup skipped (file may not exist)', { fileUri })
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
                log.gallery('Attempting to delete original file', { originalUri })
                try {
                  const fileInfo = await FileSystem.getInfoAsync(originalUri)
                  log.gallery('Original file info', { originalUri, fileInfo })
                  if (fileInfo.exists) {
                    await FileSystem.deleteAsync(originalUri)
                    log.gallery('Original file deleted successfully', { originalUri })
                  } else {
                    log.gallery('Original file does not exist, skipping deletion', { originalUri })
                  }
                } catch (error) {
                  log.gallery('Error deleting original file (may not exist)', { 
                    originalUri, 
                    error: error instanceof Error ? error.message : String(error) 
                  })
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
                  log.gallery('File cleanup skipped (file may not exist)', { fileUri })
                }
              }
              
              
              // Navigate back to camera (even if some files couldn't be deleted)
              log.gallery('Photo discard completed, navigating back to camera')
              navigation.goBack()
            } catch (error) {
              log.error('Error during discard operation', { error })
              // Still navigate back even if cleanup failed
              log.gallery('Cleanup had issues, but navigating back anyway')
              navigation.goBack()
            }
          }
        }
      ]
    )
  }

  const savePhoto = async () => {
    try {
      // Save the currently displayed version with EXIF metadata preservation
      const finalUri = displayUri || originalUri
      const success = await photoLibraryService.savePhoto(finalUri, originalUri)
      
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
      log.error('Error saving photo', { error })
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
        {displayUri ? (
          <View style={$snapbackContainer}>
            <SnapbackZoom>
              <Image
                source={{ uri: displayUri }}
                style={$photoImage}
                resizeMode="contain"
                onLoad={() => log.gallery('Image loaded successfully')}
                onError={(error) => log.gallery('Image load error', { error })}
              />
            </SnapbackZoom>
          </View>
        ) : (
          <Text style={{ color: 'white' }}>No image to display</Text>
        )}
      </View>

      {/* OLD ZOOM IMPLEMENTATION - COMMENTED OUT */}
      {/* 
      <View style={$photoContainer}>
        {displayUri && (
          <View style={{ width: '100%', height: '100%' }}>
            <ReactNativeZoomableView
              bindToBorders={true}
              maxZoom={3}
              minZoom={1}
              initialZoom={1}
              zoomStep={0.5}
              doubleTapZoomToCenter={true}
              style={{ width: '100%', height: '100%' }}
            >
              <Image
                source={{ uri: displayUri }}
                style={$photoImage}
                resizeMode="contain"
              />
            </ReactNativeZoomableView>
          </View>
        )}
      </View>
      */}

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
  flex: 1,
  justifyContent: 'flex-start', // Changed from 'center' to push image up
  alignItems: 'center',
  paddingHorizontal: 10, // Smaller padding
  paddingTop: 0, // Push image down from top
}

const $snapbackContainer: ViewStyle = {
  width: "100%",
  height: 693, // Match the image height
  justifyContent: 'center',
  alignItems: 'center',
}

const $photoImage: ImageStyle = {
  width: 442, // A few more pixels wider
  height: 693, // Proportional height
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
