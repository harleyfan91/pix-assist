import { FC, useEffect, useState } from "react"
import { View, ViewStyle, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, ImageStyle, TextStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { photoLibraryService, PhotoAsset } from "@/services/photoLibrary"

export const GalleryScreen: FC = function GalleryScreen() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const photoAssets = await photoLibraryService.getPhotos(50)
      setPhotos(photoAssets)
    } catch (err) {
      console.error('Error loading photos:', err)
      setError('Failed to load photos. Please check your permissions.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoPress = (photo: PhotoAsset) => {
    // TODO: Navigate to photo detail view
    console.log('Photo pressed:', photo.filename)
  }

  const handleRetry = () => {
    loadPhotos()
  }

  const renderPhoto = ({ item }: { item: PhotoAsset }) => (
    <TouchableOpacity
      style={$photoContainer}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.uri }}
        style={$photoImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={$emptyState}>
      <Ionicons name="images-outline" size={64} color="#666" />
      <Text preset="subheading" text="No photos found" style={$emptyText} />
      <Text text="Make sure you have photos in your library and permissions are granted." style={$emptySubtext} />
    </View>
  )

  const renderErrorState = () => (
    <View style={$errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
      <Text preset="subheading" text="Error loading photos" style={$errorText} />
      <Text text={error || "Something went wrong"} style={$errorSubtext} />
      <TouchableOpacity style={$retryButton} onPress={handleRetry}>
        <Text text="Retry" style={$retryButtonText} />
      </TouchableOpacity>
    </View>
  )

  const renderLoadingState = () => (
    <View style={$loadingState}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text text="Loading photos..." style={$loadingText} />
    </View>
  )

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$header}>
        <Text preset="heading" text="Gallery" />
        <TouchableOpacity onPress={loadPhotos} style={$refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={$content}>
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
            columnWrapperStyle={$row}
            contentContainerStyle={$photoGrid}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}

const $header: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 10,
}

const $refreshButton: ViewStyle = {
  padding: 8,
}

const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
}

const $photoGrid: ViewStyle = {
  paddingBottom: 20,
}

const $row: ViewStyle = {
  justifyContent: 'space-between',
  marginBottom: 4,
}

const $photoContainer: ViewStyle = {
  width: '31.5%',
  aspectRatio: 0.8,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: '#f0f0f0',
  marginBottom: 4,
}

const $photoImage: ImageStyle = {
  width: '100%',
  height: '100%',
}

const $emptyState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
}

const $emptyText: TextStyle = {
  marginTop: 16,
  textAlign: 'center',
}

const $emptySubtext: TextStyle = {
  marginTop: 8,
  textAlign: 'center',
  color: '#666',
  fontSize: 14,
}

const $errorState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
}

const $errorText: TextStyle = {
  marginTop: 16,
  textAlign: 'center',
  color: '#ff6b6b',
}

const $errorSubtext: TextStyle = {
  marginTop: 8,
  textAlign: 'center',
  color: '#666',
  fontSize: 14,
}

const $retryButton: ViewStyle = {
  marginTop: 20,
  paddingHorizontal: 20,
  paddingVertical: 10,
  backgroundColor: '#007AFF',
  borderRadius: 8,
}

const $retryButtonText: TextStyle = {
  color: '#fff',
  fontWeight: '600',
}

const $loadingState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}

const $loadingText: TextStyle = {
  marginTop: 16,
  color: '#666',
}
