/**
 * Error modal component for displaying critical errors that require user action.
 * Used for high and critical severity errors.
 */

import React from 'react'
import { View, ViewStyle, TextStyle, Modal, TouchableOpacity } from 'react-native'
import { Text } from '../Text'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { useAppTheme } from '@/theme/context'
import type { ThemedStyle } from '@/theme/types'
import { AppError, ErrorRecoveryAction } from '@/services/error/types'

interface ErrorModalProps {
  error: AppError
  onDismiss: () => void
  onRecover?: () => void
  visible: boolean
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ 
  error, 
  onDismiss, 
  onRecover,
  visible 
}) => {
  const { themed } = useAppTheme()

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

  const getRecoveryButtonText = () => {
    switch (error.recoveryAction) {
      case ErrorRecoveryAction.RETRY:
        return 'Retry'
      case ErrorRecoveryAction.REFRESH:
        return 'Refresh'
      case ErrorRecoveryAction.RESET:
        return 'Reset'
      case ErrorRecoveryAction.PERMISSION_REQUEST:
        return 'Grant Permission'
      case ErrorRecoveryAction.NAVIGATE_BACK:
        return 'Go Back'
      case ErrorRecoveryAction.RESTART_APP:
        return 'Restart App'
      default:
        return 'OK'
    }
  }

  const handleRecovery = () => {
    if (onRecover) {
      onRecover()
    }
    onDismiss()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={themed($overlay)}>
        <View style={themed($modal)}>
          <View style={themed($header)}>
            <Icon 
              icon={getIconName()} 
              size={48} 
              color="#ef4444"
            />
            <Text 
              style={themed($title)}
              text={error.userMessage}
              preset="subheading"
            />
          </View>

          <View style={themed($content)}>
            <Text 
              style={themed($description)}
              text={`${error.category.toUpperCase()} Error`}
              size="sm"
            />
            
            {error.context && Object.keys(error.context).length > 0 && (
              <View style={themed($contextContainer)}>
                <Text 
                  style={themed($contextTitle)}
                  text="Details:"
                  size="xs"
                />
                {Object.entries(error.context).map(([key, value]) => (
                  <Text 
                    key={key}
                    style={themed($contextItem)}
                    text={`${key}: ${value}`}
                    size="xs"
                  />
                ))}
              </View>
            )}
          </View>

          <View style={themed($actions)}>
            {error.isRecoverable && error.recoveryAction && (
              <Button
                preset="default"
                style={themed($recoveryButton)}
                onPress={handleRecovery}
                text={getRecoveryButtonText()}
              />
            )}
            <Button
              preset="reversed"
              style={themed($dismissButton)}
              onPress={onDismiss}
              text="Close"
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const $overlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
})

const $modal: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.lg,
  width: '100%',
  maxWidth: 400,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: 'center',
  marginBottom: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  textAlign: 'center',
  marginTop: spacing.sm,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: 'center',
})

const $contextContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.separator,
  borderRadius: 6,
  padding: spacing.sm,
  marginTop: spacing.sm,
})

const $contextTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontWeight: '600',
  marginBottom: spacing.xs,
})

const $contextItem: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: spacing.sm,
})

const $recoveryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.primary500,
})

const $dismissButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.separator,
})
