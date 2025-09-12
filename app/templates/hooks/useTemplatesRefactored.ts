/**
 * Refactored useTemplates hook using the new centralized error handling system.
 * This demonstrates how to migrate existing error handling to the new system.
 */

import { useState, useEffect, useCallback } from 'react'
import { Template, TemplateCategory } from '../types'
import { templateManager } from '../manager/TemplateManager'
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'

interface UseTemplatesReturn {
  templates: Template[]
  activeTemplates: string[]
  currentCategory: TemplateCategory
  currentTemplateIndex: number
  isLoading: boolean
  hasError: boolean
  activateTemplate: (templateId: string) => Promise<void>
  deactivateTemplate: (templateId: string) => Promise<void>
  setCurrentCategory: (category: TemplateCategory) => Promise<void>
  setCurrentTemplateIndex: (index: number) => Promise<void>
  getTemplateById: (id: string) => Template | undefined
  refreshTemplates: () => Promise<void>
}

export function useTemplatesRefactored(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTemplates, setActiveTemplates] = useState<string[]>([])
  const [currentCategory, setCurrentCategoryState] = useState<TemplateCategory>('grid')
  const [currentTemplateIndex, setCurrentTemplateIndexState] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)

  const { handleAsync, handleTemplateError } = useErrorHandler()

  const loadTemplates = useCallback(async () => {
    const result = await handleAsync(
      async () => {
        setIsLoading(true)
        setHasError(false)
        
        await templateManager.initialize()
        const availableTemplates = templateManager.getAvailableTemplates()
        const activeTemplatesList = templateManager.getActiveTemplates()
        const category = templateManager.getCurrentCategory()
        const templateIndex = templateManager.getCurrentTemplateIndex()
        
        setTemplates(availableTemplates)
        setActiveTemplates(activeTemplatesList)
        setCurrentCategoryState(category)
        setCurrentTemplateIndexState(templateIndex)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to load templates. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'load' },
        onError: () => setHasError(true),
        onSuccess: () => setHasError(false),
      }
    )
    
    if (result) {
      setIsLoading(false)
    }
  }, [handleAsync])

  const activateTemplate = useCallback(async (templateId: string) => {
    const result = await handleAsync(
      async () => {
        setHasError(false)
        await templateManager.activateTemplate(templateId)
        const updatedActiveTemplates = templateManager.getActiveTemplates()
        setActiveTemplates(updatedActiveTemplates)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to activate template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'activate', templateId },
        onError: () => setHasError(true),
        onSuccess: () => setHasError(false),
      }
    )
    
    return result
  }, [handleAsync])

  const deactivateTemplate = useCallback(async (templateId: string) => {
    const result = await handleAsync(
      async () => {
        setHasError(false)
        await templateManager.deactivateTemplate(templateId)
        const updatedActiveTemplates = templateManager.getActiveTemplates()
        setActiveTemplates(updatedActiveTemplates)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to deactivate template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'deactivate', templateId },
        onError: () => setHasError(true),
        onSuccess: () => setHasError(false),
      }
    )
    
    return result
  }, [handleAsync])

  const setCurrentCategory = useCallback(async (category: TemplateCategory) => {
    const result = await handleAsync(
      async () => {
        setHasError(false)
        await templateManager.setCurrentCategory(category)
        setCurrentCategoryState(category)
        setCurrentTemplateIndexState(0) // Reset to first template in category
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to switch category. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'setCategory', category },
        onError: () => setHasError(true),
        onSuccess: () => setHasError(false),
      }
    )
    
    return result
  }, [handleAsync])

  const setCurrentTemplateIndex = useCallback(async (index: number) => {
    const result = await handleAsync(
      async () => {
        setHasError(false)
        await templateManager.setCurrentTemplateIndex(index)
        setCurrentTemplateIndexState(index)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to switch template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'setTemplateIndex', index },
        onError: () => setHasError(true),
        onSuccess: () => setHasError(false),
      }
    )
    
    return result
  }, [handleAsync])

  const getTemplateById = useCallback((id: string): Template | undefined => {
    return templates.find(template => template.id === id)
  }, [templates])

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
    hasError,
    activateTemplate,
    deactivateTemplate,
    setCurrentCategory,
    setCurrentTemplateIndex,
    getTemplateById,
    refreshTemplates,
  }
}
