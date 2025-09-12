// Basic storage service for template preferences
// This is a placeholder implementation - in production you'd use a proper storage solution

interface StorageData {
  activeTemplates: string[]
  currentCategory: string
  currentTemplateIndex: number
}

class TemplateStorage {
  private storageKey = 'template_preferences'
  private defaultData: StorageData = {
    activeTemplates: ['rule_of_thirds'],
    currentCategory: 'grid',
    currentTemplateIndex: 0
  }

  /**
   * Helper method to handle storage operations with consistent error handling
   */
  private async handleStorageOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    defaultValue: T
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Failed to ${operationName}:`, error)
      return defaultValue
    }
  }

  /**
   * Helper method for operations that should throw on error
   */
  private async handleStorageOperationWithThrow<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Failed to ${operationName}:`, error)
      throw new Error(`Failed to ${operationName}`)
    }
  }

  async saveActiveTemplates(activeTemplates: string[]): Promise<void> {
    return this.handleStorageOperationWithThrow(
      async () => {
        const data = await this.getStoredData()
        data.activeTemplates = activeTemplates
        await this.saveData(data)
      },
      'save active templates'
    )
  }

  async loadActiveTemplates(): Promise<string[]> {
    return this.handleStorageOperation(
      async () => {
        const data = await this.getStoredData()
        return data.activeTemplates
      },
      'load active templates',
      this.defaultData.activeTemplates
    )
  }

  async saveCurrentCategory(category: string): Promise<void> {
    return this.handleStorageOperationWithThrow(
      async () => {
        const data = await this.getStoredData()
        data.currentCategory = category
        await this.saveData(data)
      },
      'save current category'
    )
  }

  async loadCurrentCategory(): Promise<string> {
    return this.handleStorageOperation(
      async () => {
        const data = await this.getStoredData()
        return data.currentCategory
      },
      'load current category',
      this.defaultData.currentCategory
    )
  }

  async saveCurrentTemplateIndex(index: number): Promise<void> {
    return this.handleStorageOperationWithThrow(
      async () => {
        const data = await this.getStoredData()
        data.currentTemplateIndex = index
        await this.saveData(data)
      },
      'save current template index'
    )
  }

  async loadCurrentTemplateIndex(): Promise<number> {
    return this.handleStorageOperation(
      async () => {
        const data = await this.getStoredData()
        return data.currentTemplateIndex
      },
      'load current template index',
      this.defaultData.currentTemplateIndex
    )
  }

  private async getStoredData(): Promise<StorageData> {
    // Placeholder implementation - in production, use AsyncStorage or MMKV
    // For now, return default data
    return { ...this.defaultData }
  }

  private async saveData(data: StorageData): Promise<void> {
    // Placeholder implementation - in production, use AsyncStorage or MMKV
    // For now, just log the data
    console.log('Saving template data:', data)
  }
}

export const templateStorage = new TemplateStorage()
