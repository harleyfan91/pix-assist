/**
 * Error toast component for displaying temporary error messages.
 * Used for low to medium severity errors that don't require user action.
 */

import React, { useEffect } from 'react'
import { View, ViewStyle, TextStyle, Animated, Dimensions } from 'react-native'
import { Text } from '../Text'
import { Icon } from '../Icon'
import { useAppTheme } from '@/theme/context'
import type { ThemedStyle } from '@/theme/types'
import { AppError, ErrorSeverity } from '@/services/error/types'

interface ErrorToastProps {
  error: AppError
  onDismiss: () => void
  duration?: number
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const ErrorToast: React.FC<ErrorToastProps> = ({ 
  error, 
  onDismiss, 
  duration = 4000 
}) => {
  const { themed } = useAppTheme()
  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(-100)

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // Auto dismiss
    const timer = setTimeout(() => {
      dismissToast()
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss()
    })
  }

  const getIconName = () => {
    switch (error.category) {
      case 'network':
        return 'more'
      case 'permission':
        return 'lock'
      case 'camera':
        return 'view'
      case 'template':
        return 'menu'
      case 'storage':
        return 'more'
      case 'validation':
        return 'check'
      default:
        return 'ladybug'
    }
  }

  const getToastColor = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return '#f59e0b' // amber
      case ErrorSeverity.MEDIUM:
        return '#ef4444' // red
      case ErrorSeverity.HIGH:
        return '#dc2626' // red-600
      case ErrorSeverity.CRITICAL:
        return '#991b1b' // red-800
      default:
        return '#ef4444'
    }
  }

  return (
    <Animated.View
      style={[
        themed($container),
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          borderLeftColor: getToastColor(),
        },
      ]}
    >
      <View style={themed($content)}>
        <Icon 
          icon={getIconName()} 
          size={20} 
          color={getToastColor()}
        />
        <View style={themed($textContainer)}>
          <Text 
            style={[themed($title), { color: getToastColor() }]}
            text={error.userMessage}
            numberOfLines={2}
          />
          {error.severity >= ErrorSeverity.MEDIUM && (
            <Text 
              style={themed($subtitle)}
              text={`${error.category.toUpperCase()} Error`}
              size="xs"
            />
          )}
        </View>
      </View>
    </Animated.View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: 'absolute',
  top: 60,
  left: spacing.md,
  right: spacing.md,
  backgroundColor: colors.background,
  borderRadius: 8,
  borderLeftWidth: 4,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5,
  zIndex: 1000,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.md,
})

const $textContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.sm,
})

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontWeight: '600',
  color: colors.text,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  marginTop: 2,
})
