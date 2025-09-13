import React, { useMemo } from 'react'
import { View, ViewStyle } from 'react-native'
import { useTemplates } from '../../templates/hooks/useTemplates'
import { useCameraViewfinder } from '../../hooks/useCameraViewfinder'
import { RuleOfThirds } from '../../templates/core'

interface TemplateOverlayProps {
  templateId: string | null
  screenDimensions: { width: number; height: number }
  style?: ViewStyle
}

export const TemplateOverlay: React.FC<TemplateOverlayProps> = React.memo(({
  templateId,
  screenDimensions,
  style
}) => {
  const { getTemplateById } = useTemplates()
  const viewfinder = useCameraViewfinder()
  
  if (!templateId) return null
  
  const template = getTemplateById(templateId)
  if (!template) return null

  // REVERSIBLE ANIMATION: Template overlay renderer
  // Renders the appropriate template component based on type
  // Memoized to prevent unnecessary re-renders
  const templateComponent = useMemo(() => {
    if (template.type === 'core' && template.component) {
      const CoreComponent = template.component
      return (
        <CoreComponent
          isActive={true}
          opacity={template.opacity}
          color={template.color}
          size={template.size}
          screenDimensions={{ width: viewfinder.width, height: viewfinder.height }}
        />
      )
    }
    
    // Pro templates will be implemented in future phases
    if (template.type === 'pro' && template.svgComponent) {
      const ProComponent = template.svgComponent
      return (
        <ProComponent
          customization={template.customization}
          screenDimensions={{ width: viewfinder.width, height: viewfinder.height }}
        />
      )
    }
    
    // Fallback to Rule of Thirds if template is not found or invalid
    return (
      <RuleOfThirds
        isActive={true}
        opacity={0.6}
        color="#ffffff"
        size="medium"
        screenDimensions={{ width: viewfinder.width, height: viewfinder.height }}
      />
    )
  }, [
    template.type,
    template.component,
    template.opacity,
    template.color,
    template.size,
    template.svgComponent,
    template.customization,
    viewfinder.width,
    viewfinder.height
  ])

  return (
    <View
      style={[
        {
          position: 'absolute',
          top: viewfinder.y,
          left: viewfinder.x,
          width: viewfinder.width,
          height: viewfinder.height,
          pointerEvents: 'none', // Allow touches to pass through to camera
        },
        style,
      ]}
    >
      {templateComponent}
    </View>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  // Only re-render if template ID or screen dimensions change
  return (
    prevProps.templateId === nextProps.templateId &&
    prevProps.screenDimensions.width === nextProps.screenDimensions.width &&
    prevProps.screenDimensions.height === nextProps.screenDimensions.height &&
    prevProps.style === nextProps.style
  )
})
