import { useState, useEffect, useCallback } from 'react'
import { Template, TemplateCategory } from '../types'
import { templateManager } from '../manager/TemplateManager'

interface UseTemplatesReturn {
  templates: Template[]
  activeTemplates: string[]
  currentCategory: TemplateCategory
  currentTemplateIndex: number
  isLoading: boolean
  error: string | null
  activateTemplate: (templateId: string) => Promise<void>
  deactivateTemplate: (templateId: string) => Promise<void>
  setCurrentCategory: (category: TemplateCategory) => Promise<void>
  setCurrentTemplateIndex: (index: number) => Promise<void>
  getTemplateById: (id: string) => Template | undefined
  refreshTemplates: () => Promise<void>
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTemplates, setActiveTemplates] = useState<string[]>([])
  const [currentCategory, setCurrentCategoryState] = useState<TemplateCategory>('grid')
  const [currentTemplateIndex, setCurrentTemplateIndexState] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await templateManager.initialize()
      
      const availableTemplates = templateManager.getAvailableTemplates()
      const activeTemplatesList = templateManager.getActiveTemplates()
      const category = templateManager.getCurrentCategory()
      const templateIndex = templateManager.getCurrentTemplateIndex()
      
      setTemplates(availableTemplates)
      setActiveTemplates(activeTemplatesList)
      setCurrentCategoryState(category)
      setCurrentTemplateIndexState(templateIndex)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates'
      setError(errorMessage)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const activateTemplate = useCallback(async (templateId: string) => {
    try {
      setError(null)
      await templateManager.activateTemplate(templateId)
      const updatedActiveTemplates = templateManager.getActiveTemplates()
      setActiveTemplates(updatedActiveTemplates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate template'
      setError(errorMessage)
      console.error('Error activating template:', err)
    }
  }, [])

  const deactivateTemplate = useCallback(async (templateId: string) => {
    try {
      setError(null)
      await templateManager.deactivateTemplate(templateId)
      const updatedActiveTemplates = templateManager.getActiveTemplates()
      setActiveTemplates(updatedActiveTemplates)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate template'
      setError(errorMessage)
      console.error('Error deactivating template:', err)
    }
  }, [])

  const setCurrentCategory = useCallback(async (category: TemplateCategory) => {
    try {
      setError(null)
      await templateManager.setCurrentCategory(category)
      setCurrentCategoryState(category)
      setCurrentTemplateIndexState(0) // Reset to first template in category
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set current category'
      setError(errorMessage)
      console.error('Error setting current category:', err)
    }
  }, [])

  const setCurrentTemplateIndex = useCallback(async (index: number) => {
    try {
      setError(null)
      await templateManager.setCurrentTemplateIndex(index)
      setCurrentTemplateIndexState(index)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set current template index'
      setError(errorMessage)
      console.error('Error setting current template index:', err)
    }
  }, [])

  const getTemplateById = useCallback((id: string): Template | undefined => {
    return templateManager.getTemplateById(id)
  }, [])

  const refreshTemplates = useCallback(async () => {
    await loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return {
    templates,
    activeTemplates,
    currentCategory,
    currentTemplateIndex,
    isLoading,
    error,
    activateTemplate,
    deactivateTemplate,
    setCurrentCategory,
    setCurrentTemplateIndex,
    getTemplateById,
    refreshTemplates
  }
}
