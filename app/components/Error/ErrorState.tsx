/**
 * Error state component for displaying screen-level error states.
 * Used when a screen needs to show an error state instead of its normal content.
 */

import React from 'react'
import { View, ViewStyle, TextStyle, TouchableOpacity } from 'react-native'
import { Text } from '../Text'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useAppTheme } from '@/theme/context'
import type { ThemedStyle } from '@/theme/types'
import { AppError, ErrorRecoveryAction } from '@/services/error/types'

interface ErrorStateProps {
  error: AppError
  onRetry?: () => void
  onGoBack?: () => void
  showDetails?: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  onGoBack,
  showDetails = false 
}) => {
  const { themed } = useAppTheme()

  const getIconName = () => {
    switch (error.category) {
      case 'network':
        return 'wifi-off'
      case 'permission':
        return 'lock'
      case 'camera':
        return 'camera-off'
      case 'template':
        return 'grid'
      case 'storage':
        return 'database'
      case 'validation':
        return 'alert-triangle'
      default:
        return 'alert-circle'
    }
  }

  const getRetryButtonText = () => {
    switch (error.recoveryAction) {
      case ErrorRecoveryAction.RETRY:
        return 'Try Again'
      case ErrorRecoveryAction.REFRESH:
        return 'Refresh'
      case ErrorRecoveryAction.RESET:
        return 'Reset'
      case ErrorRecoveryAction.PERMISSION_REQUEST:
        return 'Grant Permission'
      default:
        return 'Retry'
    }
  }

  return (
    <View style={themed($container)}>
      <View style={themed($content)}>
        <Icon 
          icon={getIconName()} 
          size={64} 
          color="#ef4444"
        />
        
        <Text 
          style={themed($title)}
          text={error.userMessage}
          preset="subheading"
        />
        
        <Text 
          style={themed($subtitle)}
          text={`${error.category.toUpperCase()} Error`}
          size="sm"
        />

        {showDetails && error.context && Object.keys(error.context).length > 0 && (
          <View style={themed($detailsContainer)}>
            <Text 
              style={themed($detailsTitle)}
              text="Error Details:"
              size="xs"
            />
            {Object.entries(error.context).map(([key, value]) => (
              <Text 
                key={key}
                style={themed($detailsItem)}
                text={`${key}: ${value}`}
                size="xs"
              />
            ))}
          </View>
        )}
      </View>

      <View style={themed($actions)}>
        {error.isRecoverable && onRetry && (
          <Button
            preset="default"
            style={themed($retryButton)}
            onPress={onRetry}
            text={getRetryButtonText()}
          />
        )}
        
        {onGoBack && (
          <Button
            preset="reversed"
            style={themed($backButton)}
            onPress={onGoBack}
            text="Go Back"
          />
        )}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: spacing.xl,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  marginBottom: spacing.xl,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: 'center',
  marginTop: spacing.md,
  marginBottom: spacing.sm,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: 'center',
})

const $detailsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.separator,
  borderRadius: 6,
  padding: spacing.sm,
  marginTop: spacing.md,
  width: '100%',
})

const $detailsTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontWeight: '600',
  marginBottom: spacing.xs,
})

const $detailsItem: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: 2,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: '100%',
  gap: spacing.sm,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $backButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.separator,
})
