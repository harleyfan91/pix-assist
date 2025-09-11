import React, { useRef } from 'react'
import { ScrollView, View, Dimensions, TouchableOpacity, Text } from 'react-native'
import { useTemplates } from '../../templates/hooks/useTemplates'
import { useCameraViewfinder } from '../../hooks/useCameraViewfinder'
import { TemplatePreviewCard } from './TemplatePreviewCard'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Card sizing constants
const CARD_MARGIN = 10

interface TemplateCarouselProps {
  category: 'core' | 'pro'
  onTemplateSelect: (templateId: string) => void
  onCategoryChange: (category: 'core' | 'pro') => void
  selectedTemplateId: string | null
  cameraViewRef?: React.RefObject<View | null>
}

export const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  category,
  onTemplateSelect,
  onCategoryChange,
  selectedTemplateId,
  cameraViewRef
}) => {
  const { templates } = useTemplates()
  const viewfinder = useCameraViewfinder()
  const scrollRef = useRef<ScrollView>(null)
  
  // Use viewfinder hook directly - no manual calculations
  
  // Filter templates by category and type
  const categoryTemplates = templates.filter(template => {
    if (category === 'core') {
      return template.type === 'core'
    } else {
      return template.type === 'pro'
    }
  })

  return (
    <View style={{ marginTop: 15 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 5,
          justifyContent: 'center',
        }}
        snapToInterval={viewfinder.width + CARD_MARGIN}
        decelerationRate="fast"
      >
        {/* Category Selection Card - First item users see */}
        <View style={{ 
          width: viewfinder.width, // Use full viewfinder width
          height: viewfinder.height, // Use full viewfinder height
          marginRight: CARD_MARGIN,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          transform: [{ scale: 0.95 }], // 10% uniform compression
        }}>
          {/* Core Button */}
          <TouchableOpacity
            onPress={() => onCategoryChange('core')}
            style={{
              width: '100%',
              height: '45%',
              backgroundColor: category === 'core' ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: category === 'core' ? '#007AFF' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <Text style={{
              color: category === 'core' ? '#fff' : 'rgba(255, 255, 255, 0.9)',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Core Templates
            </Text>
            <Text style={{
              color: category === 'core' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              marginTop: 4,
            }}>
              Free templates
            </Text>
          </TouchableOpacity>

          {/* Pro Button */}
          <TouchableOpacity
            onPress={() => onCategoryChange('pro')}
            style={{
              width: '100%',
              height: '45%',
              backgroundColor: category === 'pro' ? '#007AFF' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: category === 'pro' ? '#007AFF' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <Text style={{
              color: category === 'pro' ? '#fff' : 'rgba(255, 255, 255, 0.9)',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Pro Templates
            </Text>
            <Text style={{
              color: category === 'pro' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              marginTop: 4,
            }}>
              Premium features
            </Text>
          </TouchableOpacity>
        </View>

        {/* Template Cards */}
        {categoryTemplates.map((template, index) => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            onSelect={onTemplateSelect}
            isSelected={selectedTemplateId === template.id}
            cameraViewRef={cameraViewRef}
            style={{ 
              width: viewfinder.width, 
              height: viewfinder.height,
              marginRight: index < categoryTemplates.length - 1 ? CARD_MARGIN : 0 
            }}
          />
        ))}
      </ScrollView>
    </View>
  )
}
