import React from 'react'

// Shared types for the template system
export type TemplateCategory = 'grid' | 'level' | 'guide' | 'frame'
export type TemplateType = 'core' | 'pro'

export interface Template {
  id: string
  name: string
  category: TemplateCategory
  type: TemplateType
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
  // Core template specific
  component?: React.ComponentType<any>
  // Pro template specific (for future implementation)
  svgComponent?: React.ComponentType<any>
  customization?: any
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
