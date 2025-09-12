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
  
  // Initialize error handling
  const { handleAsync } = useErrorHandler()

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    await handleAsync(
      async () => {
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
        context: { operation: 'load_templates' },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to load templates'
          setError(errorMessage)
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }, [handleAsync])

  const activateTemplate = useCallback(async (templateId: string) => {
    setError(null)
    
    await handleAsync(
      async () => {
        await templateManager.activateTemplate(templateId)
        const updatedActiveTemplates = templateManager.getActiveTemplates()
        setActiveTemplates(updatedActiveTemplates)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to activate template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'activate', templateId },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to activate template'
          setError(errorMessage)
        }
      }
    )
  }, [handleAsync])

  const deactivateTemplate = useCallback(async (templateId: string) => {
    setError(null)
    
    await handleAsync(
      async () => {
        await templateManager.deactivateTemplate(templateId)
        const updatedActiveTemplates = templateManager.getActiveTemplates()
        setActiveTemplates(updatedActiveTemplates)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to deactivate template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { operation: 'deactivate', templateId },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to deactivate template'
          setError(errorMessage)
        }
      }
    )
  }, [handleAsync])

  const setCurrentCategory = useCallback(async (category: TemplateCategory) => {
    setError(null)
    
    await handleAsync(
      async () => {
        await templateManager.setCurrentCategory(category)
        setCurrentCategoryState(category)
        setCurrentTemplateIndexState(0) // Reset to first template in category
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to change template category. Please try again.',
        severity: ErrorSeverity.LOW,
        context: { operation: 'set_category', category },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to set current category'
          setError(errorMessage)
        }
      }
    )
  }, [handleAsync])

  const setCurrentTemplateIndex = useCallback(async (index: number) => {
    setError(null)
    
    await handleAsync(
      async () => {
        await templateManager.setCurrentTemplateIndex(index)
        setCurrentTemplateIndexState(index)
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to select template. Please try again.',
        severity: ErrorSeverity.LOW,
        context: { operation: 'set_index', index },
        onError: (appError) => {
          const errorMessage = appError.originalError?.message || 'Failed to set current template index'
          setError(errorMessage)
        }
      }
    )
  }, [handleAsync])

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
