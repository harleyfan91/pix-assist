// Shared types for the template system
export type TemplateCategory = 'grid' | 'level' | 'guide' | 'frame'

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
}

// Template manager state interface
export interface TemplateManagerState {
  templates: Template[]
  activeTemplates: string[]
  currentCategory: TemplateCategory
  currentTemplateIndex: number
  isLoading: boolean
  error: string | null
}
