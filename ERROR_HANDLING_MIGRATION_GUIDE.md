# Error Handling Migration Guide

This guide explains how to migrate existing error handling code to the new centralized error handling system.

## Overview

The new error handling system provides:
- **Centralized error management** through `ErrorService`
- **Unified error UI components** (toasts, modals, error states)
- **Consistent error categorization** and severity levels
- **Automatic error reporting** and recovery strategies
- **Custom hooks** for common error handling patterns

## Migration Steps

### 1. Replace Individual Error States

**Before:**
```typescript
const [error, setError] = useState<string | null>(null)

try {
  await someAsyncOperation()
  setError(null)
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to perform operation'
  setError(errorMessage)
  console.error('Error:', err)
}
```

**After:**
```typescript
import { useErrorHandler } from '@/hooks/useErrorHandling'
import { ErrorCategory, ErrorSeverity } from '@/services/error/types'

const { handleAsync } = useErrorHandler()

const result = await handleAsync(
  async () => {
    await someAsyncOperation()
  },
  {
    category: ErrorCategory.TEMPLATE, // or appropriate category
    userMessage: 'Failed to perform operation. Please try again.',
    severity: ErrorSeverity.MEDIUM,
    context: { operation: 'someOperation' },
  }
)
```

### 2. Replace Try-Catch Blocks

**Before:**
```typescript
const loadTemplates = useCallback(async () => {
  try {
    setIsLoading(true)
    setError(null)
    
    await templateManager.initialize()
    const templates = templateManager.getAvailableTemplates()
    setTemplates(templates)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load templates'
    setError(errorMessage)
    console.error('Error loading templates:', err)
  } finally {
    setIsLoading(false)
  }
}, [])
```

**After:**
```typescript
const loadTemplates = useCallback(async () => {
  const result = await handleAsync(
    async () => {
      setIsLoading(true)
      await templateManager.initialize()
      const templates = templateManager.getAvailableTemplates()
      setTemplates(templates)
    },
    {
      category: ErrorCategory.TEMPLATE,
      userMessage: 'Failed to load templates. Please try again.',
      severity: ErrorSeverity.MEDIUM,
      context: { operation: 'load' },
      onSuccess: () => setIsLoading(false),
    }
  )
  
  if (!result) {
    setIsLoading(false)
  }
}, [handleAsync])
```

### 3. Replace Custom Error UI

**Before:**
```typescript
if (error) {
  return (
    <View style={$errorState}>
      <Text text="Error loading photos" />
      <Text text={error} />
      <Button onPress={handleRetry} text="Retry" />
    </View>
  )
}
```

**After:**
```typescript
import { ErrorState } from '@/components/Error/ErrorState'
import { useErrorState } from '@/hooks/useErrorHandling'

const { currentError, hasErrors } = useErrorState()

if (hasErrors && currentError) {
  return (
    <ErrorState
      error={currentError}
      onRetry={handleRetry}
      onGoBack={() => navigation.goBack()}
      showDetails={__DEV__}
    />
  )
}
```

### 4. Update Error Boundary

**Before:**
```typescript
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
```

**After:**
```typescript
import { ErrorBoundary } from "@/components/Error/ErrorBoundary"
```

## Error Categories

Use appropriate categories for different types of errors:

- `ErrorCategory.NETWORK` - Network/API errors
- `ErrorCategory.PERMISSION` - Permission-related errors
- `ErrorCategory.CAMERA` - Camera-specific errors
- `ErrorCategory.TEMPLATE` - Template system errors
- `ErrorCategory.STORAGE` - Storage/persistence errors
- `ErrorCategory.VALIDATION` - Input validation errors
- `ErrorCategory.UNKNOWN` - Unclassified errors

## Error Severity Levels

- `ErrorSeverity.LOW` - Minor issues, show as toast
- `ErrorSeverity.MEDIUM` - Moderate issues, show as toast with retry
- `ErrorSeverity.HIGH` - Serious issues, show as modal
- `ErrorSeverity.CRITICAL` - Critical issues, show as modal with restart option

## Available Hooks

### `useErrorHandler()`
Provides methods for handling different types of errors:
- `handleAsync()` - Wrap async operations
- `handleCameraError()` - Camera-specific errors
- `handleTemplateError()` - Template-specific errors
- `handleNetworkError()` - Network-specific errors
- `handlePermissionError()` - Permission-specific errors
- `handleStorageError()` - Storage-specific errors

### `useErrorState()`
Provides access to current error state:
- `errors` - Array of all errors
- `currentError` - Currently displayed error
- `isErrorVisible` - Whether error UI is visible
- `hasErrors` - Whether there are any errors
- `hideError()` - Hide current error
- `clearErrors()` - Clear all errors

### `useErrorRecovery()`
Provides error recovery methods:
- `attemptRecovery()` - Attempt to recover from error
- `recoverFromCameraError()` - Camera-specific recovery
- `recoverFromTemplateError()` - Template-specific recovery
- `recoverFromNetworkError()` - Network-specific recovery

## Migration Checklist

- [ ] Replace individual error state variables with centralized system
- [ ] Update try-catch blocks to use `handleAsync()`
- [ ] Replace custom error UI with `ErrorState` component
- [ ] Update error boundary import
- [ ] Add appropriate error categories and severity levels
- [ ] Test error handling in different scenarios
- [ ] Verify error recovery mechanisms work correctly

## Benefits After Migration

- **Consistent UX** - All errors display consistently
- **Better Debugging** - Centralized error logging and reporting
- **Easier Maintenance** - Single place to update error handling
- **Automatic Recovery** - Built-in recovery strategies
- **Better Error Context** - Rich error information for debugging
