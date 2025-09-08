import * as MediaLibrary from 'expo-media-library'
import { Alert, Platform } from 'react-native'

export interface PhotoAsset {
  id: string
  uri: string
  width: number
  height: number
  filename: string
  creationTime: number
  modificationTime: number
  mediaType: 'photo' | 'video' | 'unknown'
}

export interface PhotoLibraryService {
  requestPermissions: () => Promise<boolean>
  getPhotos: (first?: number) => Promise<PhotoAsset[]>
  savePhoto: (uri: string) => Promise<boolean>
}

class PhotoLibraryServiceImpl implements PhotoLibraryService {
  private permissionStatus: MediaLibrary.PermissionStatus | null = null

  /**
   * Request photo library permissions
   * @returns Promise<boolean> - true if permissions granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Check current permission status
      const { status } = await MediaLibrary.getPermissionsAsync()
      this.permissionStatus = status

      if (status === MediaLibrary.PermissionStatus.GRANTED) {
        return true
      }

      if (status === MediaLibrary.PermissionStatus.DENIED) {
        // Show alert explaining why we need permissions
        Alert.alert(
          'Photo Library Access Required',
          'PixAssist needs access to your photo library to display and manage your photos. Please enable this permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => MediaLibrary.requestPermissionsAsync() }
          ]
        )
        return false
      }

      // Request permissions
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync()
      this.permissionStatus = newStatus

      if (newStatus === MediaLibrary.PermissionStatus.GRANTED) {
        return true
      }

      // Handle limited access (iOS 14+)
      if (newStatus === MediaLibrary.PermissionStatus.LIMITED) {
        console.log('Limited photo library access granted')
        return true
      }

      return false
    } catch (error) {
      console.error('Error requesting photo library permissions:', error)
      return false
    }
  }

  /**
   * Get photos from the device photo library
   * @param first - Number of photos to fetch (default: 50)
   * @returns Promise<PhotoAsset[]> - Array of photo assets
   */
  async getPhotos(first: number = 50): Promise<PhotoAsset[]> {
    try {
      // Ensure we have permissions
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error('Photo library permission not granted')
      }

      // Get photos from media library
      const result = await MediaLibrary.getAssetsAsync({
        first,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
      })

      // Transform to our PhotoAsset interface
      const photos: PhotoAsset[] = result.assets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        filename: asset.filename,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        mediaType: asset.mediaType as 'photo' | 'video' | 'unknown',
      }))

      return photos
    } catch (error) {
      console.error('Error fetching photos:', error)
      throw error
    }
  }

  /**
   * Save a photo to the device photo library
   * @param uri - URI of the photo to save
   * @returns Promise<boolean> - true if saved successfully, false otherwise
   */
  async savePhoto(uri: string): Promise<boolean> {
    try {
      // Ensure we have permissions
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error('Photo library permission not granted')
      }

      // Save photo to media library
      const asset = await MediaLibrary.saveToLibraryAsync(uri)
      
      // Check if asset was created successfully
      if (asset && asset.id) {
        console.log('Photo saved to library:', asset.id)
        return true
      } else {
        console.log('Photo saved but no asset ID returned')
        return true // Still consider it successful if no error was thrown
      }
    } catch (error) {
      console.error('Error saving photo:', error)
      return false
    }
  }

  /**
   * Get permission status
   * @returns MediaLibrary.PermissionStatus | null
   */
  getPermissionStatus(): MediaLibrary.PermissionStatus | null {
    return this.permissionStatus
  }
}

// Export singleton instance
export const photoLibraryService = new PhotoLibraryServiceImpl()
