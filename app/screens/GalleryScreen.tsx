import { FC, useEffect, useState } from "react"
import { View, ViewStyle, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, ImageStyle, TextStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { photoLibraryService, PhotoAsset } from "@/services/photoLibrary"
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { log } from '@/services/logging'
import * as styles from "./GalleryScreen.styles"

export const GalleryScreen: FC = function GalleryScreen() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize error handling
  const { handleAsync } = useErrorHandler()

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    setError(null)
    
    await handleAsync(
      async () => {
        const photoAssets = await photoLibraryService.getPhotos(50)
        setPhotos(photoAssets)
      },
      {
        category: ErrorCategory.GALLERY,
        userMessage: 'Failed to load photos. Please check your permissions and try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'load_photos', count: 50 },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to load photos. Please check your permissions.'
          setError(errorMessage)
        }
      }
    ).finally(() => {
      setLoading(false)
    })
  }

  const handlePhotoPress = (photo: PhotoAsset) => {
    // TODO: Navigate to photo detail view
    log.gallery('Photo pressed', { filename: photo.filename, id: photo.id })
  }

  const handleRetry = () => {
    loadPhotos()
  }

  const renderPhoto = ({ item }: { item: PhotoAsset }) => (
    <TouchableOpacity
      style={styles.$photoContainer}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.$photoImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.$emptyState}>
      <Ionicons name="images-outline" size={64} color="#666" />
      <Text preset="subheading" text="No photos found" style={styles.$emptyText} />
      <Text text="Make sure you have photos in your library and permissions are granted." style={styles.$emptySubtext} />
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.$errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
      <Text preset="subheading" text="Error loading photos" style={styles.$errorText} />
      <Text text={error || "Something went wrong"} style={styles.$errorSubtext} />
      <TouchableOpacity style={styles.$retryButton} onPress={handleRetry}>
        <Text text="Retry" style={styles.$retryButtonText} />
      </TouchableOpacity>
    </View>
  )

  const renderLoadingState = () => (
    <View style={styles.$loadingState}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text text="Loading photos..." style={styles.$loadingText} />
    </View>
  )

  return (
    <Screen preset="fixed" contentContainerStyle={styles.$container}>
      <View style={styles.$header}>
        <Text preset="heading" text="Gallery" />
        <TouchableOpacity onPress={loadPhotos} style={styles.$refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.$content}>
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : photos.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.$row}
            contentContainerStyle={styles.$photoGrid}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  )
}

