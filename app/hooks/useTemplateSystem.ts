import { useState, useCallback, useRef, useMemo } from 'react'
import { useTemplates } from '@/templates/hooks/useTemplates'
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'
import { log } from '@/services/logging'

export interface TemplateSystemState {
  /** Whether the template drawer is currently visible */
  isDrawerVisible: boolean
  /** Currently selected template ID (from active templates) */
  currentTemplateId: string | null
  /** Whether template system is loading */
  isLoading: boolean
  /** Any error in template operations */
  error: string | null
}

export interface TemplateSystemActions {
  /** Open the template drawer */
  openDrawer: () => void
  /** Close the template drawer */
  closeDrawer: () => void
  /** Toggle drawer visibility */
  toggleDrawer: () => void
  /** Select a template (activates it and closes drawer) */
  selectTemplate: (templateId: string) => Promise<boolean>
  /** Deactivate current template */
  deactivateCurrentTemplate: () => Promise<void>
  /** Get template by ID */
  getTemplateById: (id: string) => any
  /** Refresh templates */
  refreshTemplates: () => Promise<void>
}

export interface TemplateSystemCallbacks {
  /** Called when drawer state changes */
  onDrawerStateChange?: (isOpen: boolean) => void
  /** Called when template is selected */
  onTemplateSelected?: (templateId: string) => void
  /** Called when template is deactivated */
  onTemplateDeactivated?: (templateId: string) => void
}

export interface UseTemplateSystemReturn extends TemplateSystemState, TemplateSystemActions {}

/**
 * Custom hook for managing the complete template system
 * 
 * Consolidates all template-related state and logic:
 * - Template drawer visibility
 * - Template selection and activation
 * - Error handling for template operations
 * - Integration with existing useTemplates hook
 * 
 * @param callbacks - Optional callbacks for state changes
 * @returns TemplateSystemState and TemplateSystemActions
 */
export const useTemplateSystem = (callbacks?: TemplateSystemCallbacks): UseTemplateSystemReturn => {
  // Template drawer UI state
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  
  // Get template management from existing hook
  const {
    templates,
    activeTemplates,
    currentCategory,
    currentTemplateIndex,
    isLoading: templatesLoading,
    error: templatesError,
    activateTemplate,
    deactivateTemplate,
    getTemplateById,
    refreshTemplates: refreshTemplatesFromHook
  } = useTemplates()
  
  // Error handling
  const { handleAsync } = useErrorHandler()
  
  // Get current template ID from active templates
  const currentTemplateId = activeTemplates.length > 0 ? activeTemplates[0] : null
  
  // Open drawer
  const openDrawer = useCallback(() => {
    log.template('Opening template drawer')
    setIsDrawerVisible(true)
    callbacks?.onDrawerStateChange?.(true)
  }, [callbacks])
  
  // Close drawer
  const closeDrawer = useCallback(() => {
    log.template('Closing template drawer')
    setIsDrawerVisible(false)
    callbacks?.onDrawerStateChange?.(false)
  }, [callbacks])
  
  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    if (isDrawerVisible) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }, [isDrawerVisible, openDrawer, closeDrawer])
  
  // Select template (activate and close drawer)
  const selectTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    log.template('Selecting template', { templateId })
    
    const result = await handleAsync(
      async () => {
        // Activate the template
        await activateTemplate(templateId)
        
        // Close the drawer
        setIsDrawerVisible(false)
        callbacks?.onDrawerStateChange?.(false)
        
        // Notify callback
        callbacks?.onTemplateSelected?.(templateId)
        
        log.template('Template selected successfully', { templateId })
        return true
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to select template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { 
          operation: 'select_template', 
          templateId,
          currentCategory,
          currentTemplateIndex 
        }
      }
    )
    
    return result !== null
  }, [handleAsync, activateTemplate, callbacks, currentCategory, currentTemplateIndex])
  
  // Deactivate current template
  const deactivateCurrentTemplate = useCallback(async (): Promise<void> => {
    if (!currentTemplateId) {
      log.template('No active template to deactivate')
      return
    }
    
    log.template('Deactivating current template', { templateId: currentTemplateId })
    
    await handleAsync(
      async () => {
        await deactivateTemplate(currentTemplateId)
        callbacks?.onTemplateDeactivated?.(currentTemplateId)
        log.template('Template deactivated successfully', { templateId: currentTemplateId })
      },
      {
        category: ErrorCategory.TEMPLATE,
        userMessage: 'Failed to deactivate template. Please try again.',
        severity: ErrorSeverity.MEDIUM,
        context: { 
          operation: 'deactivate_template', 
          templateId: currentTemplateId 
        }
      }
    )
  }, [currentTemplateId, deactivateTemplate, handleAsync, callbacks])
  
  // Refresh templates
  const refreshTemplates = useCallback(async (): Promise<void> => {
    log.template('Refreshing templates')
    await refreshTemplatesFromHook()
  }, [refreshTemplatesFromHook])
  
  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    isDrawerVisible,
    currentTemplateId,
    isLoading: templatesLoading,
    error: templatesError,
    
    // Actions
    openDrawer,
    closeDrawer,
    toggleDrawer,
    selectTemplate,
    deactivateCurrentTemplate,
    getTemplateById,
    refreshTemplates,
  }), [
    // State
    isDrawerVisible,
    currentTemplateId,
    templatesLoading,
    templatesError,
    
    // Actions
    openDrawer,
    closeDrawer,
    toggleDrawer,
    selectTemplate,
    deactivateCurrentTemplate,
    getTemplateById,
    refreshTemplates,
  ])
}

/**
 * Hook for template system with navigation integration
 * 
 * This is a convenience hook that includes navigation state management
 * for components that need to coordinate with navigation state.
 */
export const useTemplateSystemWithNavigation = (
  onTemplateDrawerToggle?: (isOpen: boolean) => void
) => {
  const templateSystem = useTemplateSystem({
    onDrawerStateChange: onTemplateDrawerToggle,
  })
  
  return templateSystem
}
