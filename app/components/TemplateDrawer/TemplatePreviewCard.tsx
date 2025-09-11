import React, { useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Template } from '../../templates/types'
import { RuleOfThirds } from '../../templates/core'
import { useCameraViewfinder } from '../../hooks/useCameraViewfinder'

interface TemplatePreviewCardProps {
  template: Template
  onSelect: (templateId: string) => void
  isSelected: boolean
  cameraViewRef?: React.RefObject<View | null>
  style?: ViewStyle
}

export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  template,
  onSelect,
  isSelected,
  cameraViewRef,
  style,
}) => {
  const viewfinder = useCameraViewfinder()
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const flashOpacity = useSharedValue(0)

  // REVERSIBLE ANIMATION: Selection flash effect
  useEffect(() => {
    if (isSelected) {
      // Flash effect
      flashOpacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(0.3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      )
    }
  }, [isSelected])

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }))

  const handlePress = () => {
    // Scale animation on press
    scale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 })
    )
    
    onSelect(template.id)
  }

  // Render live template preview using viewfinder hook
  const renderTemplatePreview = () => {
    if (template.type === 'core' && template.component) {
      const CoreComponent = template.component
      return (
        <CoreComponent
          isActive={true}
          opacity={0.8}
          color="#ffffff"
          size="medium"
          screenDimensions={{ width: viewfinder.width * 0.95, height: viewfinder.height * 0.95 }}
        />
      )
    }
    
    // Pro templates will be implemented in future phases
    if (template.type === 'pro' && template.svgComponent) {
      const ProComponent = template.svgComponent
      return (
        <ProComponent
          customization={template.customization}
          screenDimensions={{ width: viewfinder.width * 0.95, height: viewfinder.height * 0.95 }}
        />
      )
    }
    
    // Fallback to Rule of Thirds for preview
    return (
      <RuleOfThirds
        isActive={true}
        opacity={0.8}
        color="#ffffff"
        size="medium"
        screenDimensions={{ width: viewfinder.width, height: viewfinder.height }}
      />
    )
  }

  return (
    <Animated.View style={[cardAnimatedStyle, style]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: 10, // Reduced padding
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isSelected ? '#007AFF' : 'rgba(255, 255, 255, 0.2)',
            height: '100%', // Use full card height
            justifyContent: 'space-between', // Space between preview and info
            transform: [{ scale: 0.95 }], // 5% uniform compression
          }}
        >
          {/* Flash overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#007AFF',
                borderRadius: 16,
                zIndex: 10,
              },
              flashAnimatedStyle,
            ]}
            pointerEvents="none"
          />

          {/* Template Preview Container - takes most of the space */}
          <View
            style={{
              width: '100%',
              flex: 1, // Take available space
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8, // Small margin before info
            }}
          >
            {/* Live Template Preview */}
            {renderTemplatePreview()}
            
            {/* Simulated camera background */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(100, 100, 100, 0.3)',
                zIndex: -1,
              }}
            />
          </View>

          {/* Template Info - compact at bottom */}
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 12, // Smaller font
                fontWeight: '600',
                marginBottom: 2, // Reduced margin
              }}
            >
              {template.name}
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10, // Smaller font
              }}
            >
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}
