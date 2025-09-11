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

  async saveActiveTemplates(activeTemplates: string[]): Promise<void> {
    try {
      const data = await this.getStoredData()
      data.activeTemplates = activeTemplates
      await this.saveData(data)
    } catch (error) {
      console.warn('Failed to save active templates:', error)
      throw new Error('Failed to save active templates')
    }
  }

  async loadActiveTemplates(): Promise<string[]> {
    try {
      const data = await this.getStoredData()
      return data.activeTemplates
    } catch (error) {
      console.warn('Failed to load active templates:', error)
      return this.defaultData.activeTemplates
    }
  }

  async saveCurrentCategory(category: string): Promise<void> {
    try {
      const data = await this.getStoredData()
      data.currentCategory = category
      await this.saveData(data)
    } catch (error) {
      console.warn('Failed to save current category:', error)
      throw new Error('Failed to save current category')
    }
  }

  async loadCurrentCategory(): Promise<string> {
    try {
      const data = await this.getStoredData()
      return data.currentCategory
    } catch (error) {
      console.warn('Failed to load current category:', error)
      return this.defaultData.currentCategory
    }
  }

  async saveCurrentTemplateIndex(index: number): Promise<void> {
    try {
      const data = await this.getStoredData()
      data.currentTemplateIndex = index
      await this.saveData(data)
    } catch (error) {
      console.warn('Failed to save current template index:', error)
      throw new Error('Failed to save current template index')
    }
  }

  async loadCurrentTemplateIndex(): Promise<number> {
    try {
      const data = await this.getStoredData()
      return data.currentTemplateIndex
    } catch (error) {
      console.warn('Failed to load current template index:', error)
      return this.defaultData.currentTemplateIndex
    }
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
