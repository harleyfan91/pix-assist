# Custom Hooks Documentation

This directory contains all custom React hooks used throughout the PixAssist application. Each hook is designed for specific functionality and includes comprehensive documentation.

## 📁 Hook Overview

| Hook | Purpose | Location | Documentation |
|------|---------|----------|---------------|
| `useCameraViewfinder` | Camera viewfinder calculations | `useCameraViewfinder.ts` | [Detailed Guide](./useCameraViewfinder.md) |
| `useCameraAnimations` | Camera animation controls | `useCameraAnimations.ts` | [See Implementation](./useCameraAnimations.ts) |
| `useCameraControls` | Camera control state management | `useCameraControls.ts` | [See Implementation](./useCameraControls.ts) |
| `useCameraGestures` | Camera gesture handling | `useCameraGestures.ts` | [See Implementation](./useCameraGestures.ts) |
| `useDeviceOrientation` | Device orientation tracking | `useDeviceOrientation.ts` | [See Implementation](./useDeviceOrientation.ts) |
| `useIconRotation` | Icon rotation animations | `useIconRotation.ts` | [See Implementation](./useIconRotation.ts) |

## 🎯 Key Hooks

### `useCameraViewfinder()`
**Most Important Hook** - Essential for template system and camera UI alignment

```typescript
import { useCameraViewfinder } from '@/hooks/useCameraViewfinder'

const viewfinder = useCameraViewfinder()
// Returns: { width, height, x, y, aspectRatio, blackBars }
```

**Critical Features**:
- **Empirically determined**: 82% of screen height for viewfinder area
- **Perfect alignment**: Accounts for camera's `resizeMode="contain"` behavior
- **Comprehensive data**: Includes black bar calculations and aspect ratios
- **Performance optimized**: Memoized calculations

**Usage Patterns**:
- **Direct positioning**: `top: viewfinder.y, left: viewfinder.x`
- **Centered positioning**: `top: (SCREEN_HEIGHT - viewfinder.height) / 2`
- **Preview scaling**: Scale down while maintaining aspect ratio

**Documentation**: See [useCameraViewfinder.md](./useCameraViewfinder.md) for complete usage guide

### `useCameraAnimations()`
Manages camera interface animations and transitions

```typescript
import { useCameraAnimations } from '@/hooks/useCameraAnimations'

const {
  isControlsVisible,
  isModeMenuVisible,
  showControls,
  hideControls,
  toggleModeMenu
} = useCameraAnimations()
```

**Features**:
- **Spring animations**: Smooth, natural motion
- **State management**: Controls visibility states
- **Gesture integration**: Works with camera gestures
- **Performance optimized**: Efficient animation handling

### `useCameraControls()`
Manages camera control state and interactions

```typescript
import { useCameraControls } from '@/hooks/useCameraControls'

const {
  exposure,
  setExposure,
  zoom,
  setZoom,
  focus,
  setFocus
} = useCameraControls()
```

**Features**:
- **Exposure control**: Manual exposure adjustment
- **Zoom management**: Camera zoom state
- **Focus control**: Focus point management
- **State persistence**: Maintains settings across sessions

### `useCameraGestures()`
Handles camera gesture interactions

```typescript
import { useCameraGestures } from '@/hooks/useCameraGestures'

const {
  gestureHandlers,
  isGestureActive,
  gestureState
} = useCameraGestures()
```

**Features**:
- **Tap gestures**: Focus and exposure control
- **Pinch gestures**: Zoom control
- **Pan gestures**: Camera movement
- **Gesture state**: Real-time gesture tracking

### `useDeviceOrientation()`
Tracks device orientation changes

```typescript
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'

const {
  orientation,
  isPortrait,
  isLandscape,
  orientationAngle
} = useDeviceOrientation()
```

**Features**:
- **Real-time tracking**: Live orientation updates
- **Boolean helpers**: Easy orientation checks
- **Angle calculation**: Precise orientation angles
- **Performance optimized**: Efficient orientation detection

### `useIconRotation()`
Manages icon rotation animations

```typescript
import { useIconRotation } from '@/hooks/useIconRotation'

const {
  rotationStyle,
  rotateTo,
  resetRotation
} = useIconRotation()
```

**Features**:
- **Smooth rotation**: Spring-based rotation animations
- **State management**: Rotation state tracking
- **Reset functionality**: Return to original position
- **Performance optimized**: Efficient animation handling

## 🔧 Development Guidelines

### Creating New Hooks

1. **Follow naming convention**: `use[FeatureName]`
2. **Include TypeScript types**: Define proper interfaces
3. **Add JSDoc comments**: Document parameters and return values
4. **Optimize performance**: Use `useMemo` and `useCallback` where appropriate
5. **Test thoroughly**: Ensure hooks work in all scenarios

### Hook Structure Template

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react'

interface UseFeatureNameProps {
  // Define props interface
}

interface UseFeatureNameReturn {
  // Define return interface
}

export function useFeatureName(props: UseFeatureNameProps): UseFeatureNameReturn {
  // Hook implementation
  
  return {
    // Return values
  }
}
```

### Performance Best Practices

- **Memoize expensive calculations**: Use `useMemo` for complex computations
- **Memoize callbacks**: Use `useCallback` for event handlers
- **Avoid unnecessary re-renders**: Optimize dependency arrays
- **Use refs for mutable values**: Avoid state for values that don't trigger re-renders

## 📚 Additional Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Performance Optimization](https://react.dev/learn/render-and-commit)
- [TypeScript with Hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks/)

## 🐛 Troubleshooting

### Common Issues

1. **Stale closures**: Use `useCallback` with proper dependencies
2. **Infinite re-renders**: Check dependency arrays in `useEffect`
3. **Memory leaks**: Clean up subscriptions and timers
4. **Type errors**: Ensure proper TypeScript interfaces

### Debug Tips

- Use React DevTools Profiler to identify performance issues
- Add console logs to track hook execution
- Use `useDebugValue` for custom hook debugging
- Test hooks in isolation with React Testing Library
