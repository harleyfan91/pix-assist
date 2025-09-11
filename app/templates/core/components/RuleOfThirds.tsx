import React from 'react'
import { View, ViewStyle } from 'react-native'
import { CoreTemplateProps } from '../types'

// REVERSIBLE ANIMATION: Rule of Thirds grid overlay component
// Memoized for performance optimization
export const RuleOfThirds: React.FC<CoreTemplateProps> = React.memo(({
  isActive,
  opacity,
  color,
  size,
  screenDimensions
}) => {
  if (!isActive) return null

  const { width, height } = screenDimensions
  const lineOpacity = opacity * 0.6

  // Calculate line thickness based on size
  const lineThickness = size === 'small' ? 0.5 : size === 'medium' ? 1 : 1.5

  const $verticalLine: ViewStyle = {
    position: 'absolute',
    width: lineThickness,
    height: height,
    backgroundColor: color,
    opacity: lineOpacity,
  }

  const $horizontalLine: ViewStyle = {
    position: 'absolute',
    width: width,
    height: lineThickness,
    backgroundColor: color,
    opacity: lineOpacity,
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Vertical lines at 1/3 and 2/3 */}
      <View style={[$verticalLine, { left: width / 3 }]} />
      <View style={[$verticalLine, { left: (width * 2) / 3 }]} />
      
      {/* Horizontal lines at 1/3 and 2/3 */}
      <View style={[$horizontalLine, { top: height / 3 }]} />
      <View style={[$horizontalLine, { top: (height * 2) / 3 }]} />
    </View>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.opacity === nextProps.opacity &&
    prevProps.color === nextProps.color &&
    prevProps.size === nextProps.size &&
    prevProps.screenDimensions.width === nextProps.screenDimensions.width &&
    prevProps.screenDimensions.height === nextProps.screenDimensions.height
  )
})

RuleOfThirds.displayName = 'RuleOfThirds'
