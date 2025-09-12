import * as MediaLibrary from 'expo-media-library'
import { Alert, Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { exifService } from './exifService'
import { ErrorService } from '@/services/error/ErrorService'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'

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

      // Handle limited access (iOS 14+) - check if LIMITED exists
      if (newStatus === 'limited' as any) {
        console.log('Limited photo library access granted')
        return true
      }

      return false
    } catch (error) {
      // Use centralized error handling for permission errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.PERMISSION,
        userMessage: 'Failed to request photo library permissions. Please check your device settings.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'request_permissions', permissionType: 'photo_library' }
      })
      
      ErrorService.handleError(appError)
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
      // Use centralized error handling for gallery errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.GALLERY,
        userMessage: 'Failed to load photos from your library. Please check your permissions and try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'get_photos', count: first }
      })
      
      ErrorService.handleError(appError)
      throw appError
    }
  }

  /**
   * Save a photo to the device photo library with EXIF metadata preservation
   * @param uri - URI of the photo to save
   * @param originalUri - URI of the original photo (for metadata preservation)
   * @returns Promise<boolean> - true if saved successfully, false otherwise
   */
  async savePhoto(uri: string, originalUri?: string): Promise<boolean> {
    try {
      // Ensure we have permissions
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error('Photo library permission not granted')
      }

      let finalUri = uri

      // Always preserve EXIF metadata from the original photo
      if (originalUri && originalUri !== uri) {
        console.log('Preserving EXIF metadata from original photo')
        const metadataPreservedUri = await exifService.preserveMetadata(originalUri, uri)
        if (metadataPreservedUri) {
          finalUri = metadataPreservedUri
          console.log('EXIF metadata preserved successfully')
        } else {
          console.log('Failed to preserve EXIF metadata, using processed photo')
        }
      } else {
        // For the original photo, read and preserve all EXIF data
        console.log('Preserving EXIF metadata for original photo')
        const exifData = await exifService.readExifData(uri)
        if (exifData) {
          console.log('Writing complete EXIF data to photo before saving')
          const exifPreservedUri = await exifService.writeExifData(uri, exifData)
          if (exifPreservedUri) {
            finalUri = exifPreservedUri
            console.log('Complete EXIF metadata preserved successfully')
          } else {
            console.log('Failed to preserve EXIF metadata, using original photo')
          }
        } else {
          console.log('No EXIF data found, using original photo')
        }
      }

      // Verify EXIF data is present before saving
      console.log('Verifying EXIF data before saving to library')
      const verifyExif = await exifService.readExifData(finalUri)
      if (verifyExif) {
        console.log('EXIF verification - Key metadata before save:', {
          Make: verifyExif.Make,
          Model: verifyExif.Model,
          LensMake: verifyExif.LensMake,
          LensModel: verifyExif.LensModel,
          FocalLength: verifyExif.FocalLength,
          FNumber: verifyExif.FNumber,
          Orientation: verifyExif.Orientation
        })
      } else {
        console.log('WARNING: No EXIF data found before saving!')
      }

      // Create a permanent copy with EXIF data before saving to library
      console.log('Creating permanent copy with EXIF data for library save')
      const timestamp = Date.now()
      const extension = finalUri.split('.').pop() || 'jpg'
      const permanentUri = `${FileSystem.documentDirectory}photo_${timestamp}.${extension}`
      
      // Copy the file with EXIF data to a permanent location
      await FileSystem.copyAsync({
        from: finalUri,
        to: permanentUri
      })

      console.log('Permanent copy created at:', permanentUri)

      // Verify EXIF data is still present in the copy
      const copyExif = await exifService.readExifData(permanentUri)
      if (copyExif) {
        console.log('EXIF verification - Key metadata in copy:', {
          Make: copyExif.Make,
          Model: copyExif.Model,
          LensMake: copyExif.LensMake,
          LensModel: copyExif.LensModel,
          FocalLength: copyExif.FocalLength,
          FNumber: copyExif.FNumber,
          Orientation: copyExif.Orientation
        })
      } else {
        console.log('WARNING: No EXIF data found in copy!')
      }

      // Save the permanent copy to media library
      await MediaLibrary.saveToLibraryAsync(permanentUri)
      
      // Clean up the permanent copy after saving
      try {
        await FileSystem.deleteAsync(permanentUri)
        console.log('Permanent copy cleaned up successfully')
      } catch (cleanupError) {
        console.log('Note: Could not clean up permanent copy:', cleanupError)
      }
      
      // If no error was thrown, consider it successful
      console.log('Photo saved to library successfully with EXIF metadata')
      return true
    } catch (error) {
      // Use centralized error handling for photo save errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.GALLERY,
        userMessage: 'Failed to save photo to your library. Please check your permissions and try again.',
        severity: ErrorSeverity.HIGH,
        context: { operation: 'save_photo', uri, originalUri }
      })
      
      ErrorService.handleError(appError)
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
