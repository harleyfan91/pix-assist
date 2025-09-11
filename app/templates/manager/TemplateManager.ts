import { CoreTemplate } from '../core/types'
import { Template, TemplateCategory, TemplateType } from '../types'
import { templateStorage } from './TemplateStorage'
import { RuleOfThirds } from '../core'

class TemplateManager {
  private templates: Template[] = []
  private activeTemplates: string[] = []
  private currentCategory: TemplateCategory = 'grid'
  private currentTemplateIndex = 0

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates(): void {
    // Initialize with just the Rule of Thirds template for foundation phase
    this.templates = [
      {
        id: 'rule_of_thirds',
        name: 'Rule of Thirds',
        category: 'grid',
        type: 'core',
        component: RuleOfThirds,
        isActive: true,
        opacity: 0.6,
        color: '#ffffff',
        size: 'medium'
      }
    ]
  }

  async initialize(): Promise<void> {
    try {
      // Load saved preferences
      this.activeTemplates = await templateStorage.loadActiveTemplates()
      this.currentCategory = (await templateStorage.loadCurrentCategory()) as TemplateCategory
      this.currentTemplateIndex = await templateStorage.loadCurrentTemplateIndex()
    } catch (error) {
      console.warn('Failed to initialize template manager:', error)
      // Use defaults
      this.activeTemplates = ['rule_of_thirds']
      this.currentCategory = 'grid'
      this.currentTemplateIndex = 0
    }
  }

  getAvailableTemplates(): Template[] {
    return [...this.templates]
  }

  getActiveTemplates(): string[] {
    return [...this.activeTemplates]
  }

  getCurrentCategory(): TemplateCategory {
    return this.currentCategory
  }

  getCurrentTemplateIndex(): number {
    return this.currentTemplateIndex
  }

  async activateTemplate(templateId: string): Promise<void> {
    const template = this.templates.find(t => t.id === templateId)
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`)
    }

    if (!this.activeTemplates.includes(templateId)) {
      this.activeTemplates.push(templateId)
      await templateStorage.saveActiveTemplates(this.activeTemplates)
    }
  }

  async deactivateTemplate(templateId: string): Promise<void> {
    const index = this.activeTemplates.indexOf(templateId)
    if (index > -1) {
      this.activeTemplates.splice(index, 1)
      await templateStorage.saveActiveTemplates(this.activeTemplates)
    }
  }

  async setCurrentCategory(category: TemplateCategory): Promise<void> {
    this.currentCategory = category
    this.currentTemplateIndex = 0 // Reset to first template in category
    await templateStorage.saveCurrentCategory(category)
    await templateStorage.saveCurrentTemplateIndex(0)
  }

  async setCurrentTemplateIndex(index: number): Promise<void> {
    this.currentTemplateIndex = index
    await templateStorage.saveCurrentTemplateIndex(index)
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id)
  }
}

export const templateManager = new TemplateManager()
