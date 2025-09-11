import { readAsync, writeAsync, ExifTags } from '@lodev09/react-native-exify'
import * as FileSystem from 'expo-file-system'

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
      console.log('Reading EXIF data from:', uri)
      const exifData = await readAsync(uri)
      console.log('EXIF data read successfully:', exifData)
      return exifData || null
    } catch (error) {
      console.error('Error reading EXIF data:', error)
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
      console.log('Writing EXIF data to:', uri)
      console.log('EXIF tags to write (first 10 keys):', Object.keys(tags).slice(0, 10))
      console.log('Key camera metadata being written:', {
        Make: tags.Make,
        Model: tags.Model,
        LensMake: tags.LensMake,
        LensModel: tags.LensModel,
        FocalLength: tags.FocalLength,
        FNumber: tags.FNumber,
        Orientation: tags.Orientation
      })
      
      const result = await writeAsync(uri, tags)
      console.log('EXIF data written successfully:', result)
      
      if (result?.uri) {
        console.log('New URI after EXIF write:', result.uri)
        return result.uri
      } else {
        console.log('No URI returned from EXIF write, using original')
        return uri
      }
    } catch (error) {
      console.error('Error writing EXIF data:', error)
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
      console.log('Correcting orientation for:', inputUri)
      
      // Read EXIF data to get orientation
      const exifData = await this.readExifData(inputUri)
      if (!exifData) {
        console.log('No EXIF data found, returning original URI')
        return inputUri
      }

      const orientation = exifData.Orientation
      console.log('Original orientation:', orientation)

      // If orientation is 1 (normal), no correction needed
      if (!orientation || orientation === 1) {
        console.log('Image is already in correct orientation')
        return inputUri
      }

      // For now, we'll preserve the original EXIF data but note the orientation
      // In a full implementation, you might want to use an image processing library
      // to actually rotate the image and set orientation to 1
      console.log('Orientation correction needed (orientation:', orientation, ')')
      
      // Return the original URI for now - the EXIF orientation will be preserved
      // and the display layer should handle the rotation
      return inputUri
    } catch (error) {
      console.error('Error correcting orientation:', error)
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
      console.log('Preserving metadata from original to processed image')
      console.log('Original URI:', originalUri)
      console.log('Processed URI:', processedUri)

      // Read EXIF data from original image
      const originalExif = await this.readExifData(originalUri)
      if (!originalExif) {
        console.log('No EXIF data in original image, returning processed URI')
        return processedUri
      }

      console.log('Original EXIF data keys:', Object.keys(originalExif))
      console.log('Key camera metadata:', {
        Make: originalExif.Make,
        Model: originalExif.Model,
        LensMake: originalExif.LensMake,
        LensModel: originalExif.LensModel,
        FocalLength: originalExif.FocalLength,
        FNumber: originalExif.FNumber,
        Orientation: originalExif.Orientation
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
        console.log('Metadata preserved successfully to:', result)
        
        // Verify the EXIF data was written correctly
        const verifyExif = await this.readExifData(result)
        if (verifyExif) {
          console.log('Verification - EXIF data after writing:', {
            Make: verifyExif.Make,
            Model: verifyExif.Model,
            LensMake: verifyExif.LensMake,
            LensModel: verifyExif.LensModel,
            FocalLength: verifyExif.FocalLength,
            FNumber: verifyExif.FNumber,
            Orientation: verifyExif.Orientation
          })
        }
        
        return result
      } else {
        console.log('Failed to preserve metadata, returning processed URI')
        return processedUri
      }
    } catch (error) {
      console.error('Error preserving metadata:', error)
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
