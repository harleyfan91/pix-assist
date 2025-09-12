import { readAsync, writeAsync, ExifTags } from '@lodev09/react-native-exify'
import * as FileSystem from 'expo-file-system'
import { ErrorService } from '@/services/error/ErrorService'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { log } from '@/services/logging'

export interface ExifService {
  readExifData: (uri: string) => Promise<ExifTags | null>
  writeExifData: (uri: string, tags: ExifTags) => Promise<string | null>
  correctOrientation: (inputUri: string) => Promise<string | null>
  preserveMetadata: (originalUri: string, processedUri: string) => Promise<string | null>
}

class ExifServiceImpl implements ExifService {
  /**
   * Read EXIF data from an image
   * @param uri - URI of the image to read
   * @returns Promise<ExifTags | null> - EXIF data or null if failed
   */
  async readExifData(uri: string): Promise<ExifTags | null> {
    try {
      log.exif('Reading EXIF data from image', { uri })
      const exifData = await readAsync(uri)
      log.exif('EXIF data read successfully', { uri, dataKeys: Object.keys(exifData || {}) })
      return exifData || null
    } catch (error) {
      // Use centralized error handling for EXIF read errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.STORAGE,
        userMessage: 'Failed to read photo metadata. The photo may be corrupted.',
        severity: ErrorSeverity.LOW,
        context: { operation: 'read_exif', uri }
      })
      
      ErrorService.handleError(appError)
      return null
    }
  }

  /**
   * Write EXIF data to an image
   * @param uri - URI of the image to write to
   * @param tags - EXIF tags to write
   * @returns Promise<string | null> - New URI or null if failed
   */
  async writeExifData(uri: string, tags: ExifTags): Promise<string | null> {
    try {
      log.exif('Writing EXIF data to image', { 
        uri, 
        tagCount: Object.keys(tags).length,
        firstKeys: Object.keys(tags).slice(0, 10)
      })
      
      const keyMetadata = {
        Make: tags.Make,
        Model: tags.Model,
        LensMake: tags.LensMake,
        LensModel: tags.LensModel,
        FocalLength: tags.FocalLength,
        FNumber: tags.FNumber,
        Orientation: tags.Orientation
      }
      log.exif('Key camera metadata being written', { uri, metadata: keyMetadata })
      
      const result = await writeAsync(uri, tags)
      log.exif('EXIF data written successfully', { uri, resultUri: result?.uri })
      
      if (result?.uri) {
        log.exif('New URI after EXIF write', { originalUri: uri, newUri: result.uri })
        return result.uri
      } else {
        log.exif('No URI returned from EXIF write, using original', { uri })
        return uri
      }
    } catch (error) {
      // Use centralized error handling for EXIF write errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.STORAGE,
        userMessage: 'Failed to write photo metadata. The photo may be corrupted or read-only.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'write_exif', uri, tagCount: Object.keys(tags).length }
      })
      
      ErrorService.handleError(appError)
      return null
    }
  }

  /**
   * Correct image orientation based on EXIF data
   * @param inputUri - URI of the input image
   * @returns Promise<string | null> - URI of corrected image or null if failed
   */
  async correctOrientation(inputUri: string): Promise<string | null> {
    try {
      log.exif('Correcting orientation for image', { inputUri })
      
      // Read EXIF data to get orientation
      const exifData = await this.readExifData(inputUri)
      if (!exifData) {
        log.exif('No EXIF data found, returning original URI', { inputUri })
        return inputUri
      }

      const orientation = exifData.Orientation
      log.exif('Original orientation detected', { inputUri, orientation })

      // If orientation is 1 (normal), no correction needed
      if (!orientation || orientation === 1) {
        log.exif('Image is already in correct orientation', { inputUri, orientation })
        return inputUri
      }

      // For now, we'll preserve the original EXIF data but note the orientation
      // In a full implementation, you might want to use an image processing library
      // to actually rotate the image and set orientation to 1
      log.exif('Orientation correction needed', { inputUri, orientation })
      
      // Return the original URI for now - the EXIF orientation will be preserved
      // and the display layer should handle the rotation
      return inputUri
    } catch (error) {
      // Use centralized error handling for orientation correction errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.STORAGE,
        userMessage: 'Failed to correct photo orientation. Using original image.',
        severity: ErrorSeverity.LOW,
        context: { operation: 'correct_orientation', inputUri }
      })
      
      ErrorService.handleError(appError)
      return inputUri // Return original on error
    }
  }

  /**
   * Preserve metadata from original image when processing
   * @param originalUri - URI of the original image
   * @param processedUri - URI of the processed image
   * @returns Promise<string | null> - URI of image with preserved metadata or null if failed
   */
  async preserveMetadata(originalUri: string, processedUri: string): Promise<string | null> {
    try {
      log.exif('Preserving metadata from original to processed image', { originalUri, processedUri })

      // Read EXIF data from original image
      const originalExif = await this.readExifData(originalUri)
      if (!originalExif) {
        log.exif('No EXIF data in original image, returning processed URI', { originalUri, processedUri })
        return processedUri
      }

      const keyMetadata = {
        Make: originalExif.Make,
        Model: originalExif.Model,
        LensMake: originalExif.LensMake,
        LensModel: originalExif.LensModel,
        FocalLength: originalExif.FocalLength,
        FNumber: originalExif.FNumber,
        Orientation: originalExif.Orientation
      }
      log.exif('Original EXIF data keys and metadata', { 
        originalUri, 
        dataKeys: Object.keys(originalExif),
        keyMetadata 
      })

      // Create a copy of the processed image to avoid modifying the original
      const timestamp = Date.now()
      const extension = processedUri.split('.').pop() || 'jpg'
      const tempUri = `${FileSystem.cacheDirectory}temp_${timestamp}.${extension}`
      
      // Copy processed image to temp location
      await FileSystem.copyAsync({
        from: processedUri,
        to: tempUri
      })

      // Write original EXIF data to the copied image
      const result = await this.writeExifData(tempUri, originalExif)
      
      if (result) {
        log.exif('Metadata preserved successfully', { 
          originalUri, 
          processedUri, 
          resultUri: result 
        })
        
        // Verify the EXIF data was written correctly
        const verifyExif = await this.readExifData(result)
        if (verifyExif) {
          const verifyMetadata = {
            Make: verifyExif.Make,
            Model: verifyExif.Model,
            LensMake: verifyExif.LensMake,
            LensModel: verifyExif.LensModel,
            FocalLength: verifyExif.FocalLength,
            FNumber: verifyExif.FNumber,
            Orientation: verifyExif.Orientation
          }
          log.exif('Verification - EXIF data after writing', { 
            resultUri: result, 
            verifyMetadata 
          })
        }
        
        return result
      } else {
        log.exif('Failed to preserve metadata, returning processed URI', { 
          originalUri, 
          processedUri 
        })
        return processedUri
      }
    } catch (error) {
      // Use centralized error handling for metadata preservation errors
      const appError = ErrorService.createError({
        originalError: error as Error,
        category: ErrorCategory.STORAGE,
        userMessage: 'Failed to preserve photo metadata. Using processed image without metadata.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'preserve_metadata', originalUri, processedUri }
      })
      
      ErrorService.handleError(appError)
      return processedUri // Return processed on error
    }
  }

  /**
   * Get orientation value from EXIF data
   * @param exifData - EXIF data object
   * @returns number - Orientation value (1-8) or 1 if not found
   */
  getOrientation(exifData: ExifTags | null): number {
    return exifData?.Orientation || 1
  }

  /**
   * Check if image needs orientation correction
   * @param exifData - EXIF data object
   * @returns boolean - True if correction needed
   */
  needsOrientationCorrection(exifData: ExifTags | null): boolean {
    const orientation = this.getOrientation(exifData)
    return orientation > 1
  }
}

// Export singleton instance
export const exifService = new ExifServiceImpl()
