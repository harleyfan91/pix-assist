import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useTemplates } from '../../templates/hooks/useTemplates'
import { useCameraViewfinder } from '../../hooks/useCameraViewfinder'
import { RuleOfThirds } from '../../templates/core'

interface TemplateOverlayProps {
  templateId: string | null
  screenDimensions: { width: number; height: number }
  style?: ViewStyle
}

export const TemplateOverlay: React.FC<TemplateOverlayProps> = ({
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
  const renderTemplate = () => {
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
  }

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
      {renderTemplate()}
    </View>
  )
}
