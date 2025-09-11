import React from 'react'

export interface CoreTemplate {
  id: string
  name: string
  category: 'grid' | 'level' | 'guide' | 'frame'
  component: React.ComponentType<CoreTemplateProps>
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
}

export interface CoreTemplateProps {
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
  screenDimensions: { width: number; height: number }
}
