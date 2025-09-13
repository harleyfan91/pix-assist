# Performance Optimization Guide

This guide documents the performance optimization best practices implemented in PixAssist and provides guidelines for future development.

## 🎯 Performance Optimization Phases

### Phase 1: Component Memoization
**Goal**: Prevent unnecessary re-renders of extracted components

**Implementation**:
```typescript
// Wrap components with React.memo and custom comparison
export const CameraControls: React.FC<CameraControlsProps> = React.memo(({
  onNavigateToGallery,
  shutterButtonGesture,
  // ... other props
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.shutterPressed === nextProps.shutterPressed &&
    prevProps.isCapturing === nextProps.isCapturing &&
    // ... compare only relevant props
  )
})
```

**Components Optimized**:
- `CameraControls`
- `CameraOverlays` 
- `TemplateDrawer`
- `TemplateOverlay`

**Expected Impact**: 50% reduction in unnecessary re-renders

### Phase 2: Callback Optimization
**Goal**: Prevent callback recreations and expensive recalculations

**Implementation**:
```typescript
// Memoize expensive calculations
const screenDimensions = useMemo(() => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT
}), [])

// Memoize callbacks
const handleCameraError = useCallback((error: any) => {
  handleAsync(() => {
    throw error
  }, {
    category: ErrorCategory.CAMERA,
    userMessage: 'Camera error occurred. Please try again.',
    severity: ErrorSeverity.HIGH
  })
}, [handleAsync])
```

**Optimizations Applied**:
- Memoized `screenDimensions` calculation
- Memoized `popupState` object
- Extracted camera error handler to `useCallback`

**Expected Impact**: 40% reduction in callback recreations

### Phase 3: Custom Hooks Optimization
**Goal**: Prevent unnecessary re-renders from hook return objects

**Implementation**:
```typescript
// Memoize return object with proper dependencies
return useMemo(() => ({
  // State
  isLoading,
  hasPermission: hasPermission ?? false,
  isDenied,
  error,
  
  // Actions
  requestPermission,
  openSettings,
  reset,
}), [
  // Include all dependencies
  isLoading,
  hasPermission,
  isDenied,
  error,
  requestPermission,
  openSettings,
  reset,
])
```

**Hooks Optimized**:
- `useCameraControls`
- `useTemplateSystem`
- `useCameraPermissions`

**Expected Impact**: 50% reduction in hook-related re-renders

### Phase 4: FlatList Performance
**Goal**: Optimize scrolling performance with large lists

**Implementation**:
```typescript
// Memoize render functions
const renderPhoto = useCallback(({ item }: { item: PhotoAsset }) => (
  <TouchableOpacity onPress={() => handlePhotoPress(item)}>
    <Image
      source={{ uri: item.uri }}
      style={styles.$photoImage}
      resizeMode="cover"
      // Performance optimizations
      fadeDuration={0}
      progressiveRenderingEnabled={true}
      cache="force-cache"
    />
  </TouchableOpacity>
), [handlePhotoPress])

// Add performance props to FlatList
<FlatList
  data={photos}
  renderItem={renderPhoto}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={15}
  windowSize={10}
  onEndReachedThreshold={0.5}
  scrollEventThrottle={16}
/>
```

**Expected Impact**: 70% improvement in scroll performance

### Phase 5: Advanced Optimizations
**Goal**: Optimize template rendering and add performance monitoring

**Implementation**:
```typescript
// Memoize template component rendering
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
  // ... other template types
}, [
  template.type,
  template.component,
  template.opacity,
  template.color,
  template.size,
  viewfinder.width,
  viewfinder.height
])
```

**Optimizations Applied**:
- Template component memoization
- Image loading optimizations
- Performance monitoring utilities
- Navigation warning fixes

**Expected Impact**: 30% improvement in template rendering and image loading

## 📊 Performance Monitoring

### Performance Measurement Utilities
```typescript
import { measureAsync, measureSync } from '@/utils/performanceMonitor'

// Measure async operations
const result = await measureAsync(
  'gallery-load-photos',
  'GalleryScreen',
  'loadPhotos',
  async () => {
    const photoAssets = await photoLibraryService.getPhotos(50)
    setPhotos(photoAssets)
  },
  { photoCount: 50 }
)

// Measure sync operations
const result = measureSync(
  'template-render',
  'TemplateOverlay',
  'renderTemplate',
  () => {
    return renderTemplateComponent()
  }
)
```

### Performance Metrics
- **Component re-renders**: Track with React DevTools Profiler
- **Hook performance**: Monitor with performance measurement utilities
- **FlatList performance**: Measure scroll frame drops
- **Memory usage**: Monitor with React Native Performance Monitor

## 🚀 Best Practices

### Component Development
1. **Always use `React.memo`** for extracted components
2. **Implement custom comparison functions** for optimal performance
3. **Memoize expensive calculations** with `useMemo`
4. **Use `useCallback`** for all event handlers and render functions

### Hook Development
1. **Memoize return objects** with `useMemo`
2. **Include all dependencies** in memoization arrays
3. **Use `useCallback`** for functions returned from hooks
4. **Test performance** with measurement utilities

### FlatList Optimization
1. **Implement `getItemLayout`** for better scroll performance
2. **Use performance props** (`removeClippedSubviews`, `maxToRenderPerBatch`)
3. **Memoize render functions** with `useCallback`
4. **Optimize image loading** with caching and progressive rendering

### Template Rendering
1. **Memoize template components** to prevent unnecessary re-renders
2. **Use stable references** for screen dimensions
3. **Optimize dependency arrays** for memoization
4. **Monitor performance** with measurement utilities

## 🔧 Performance Tools

### React DevTools Profiler
- **Component re-renders**: Identify unnecessary re-renders
- **Render timing**: Measure component render performance
- **Memory usage**: Monitor memory consumption

### Performance Measurement
- **Async operations**: Use `measureAsync` for timing async functions
- **Sync operations**: Use `measureSync` for timing sync functions
- **Component performance**: Use `startTiming` and `endTiming`

### FlatList Performance
- **Scroll performance**: Monitor frame drops during scrolling
- **Memory usage**: Track memory consumption with large lists
- **Render batching**: Optimize `maxToRenderPerBatch` and `updateCellsBatchingPeriod`

## 📈 Expected Performance Improvements

### Overall Impact
- **60-80% reduction** in unnecessary re-renders
- **70% improvement** in scroll performance with large lists
- **50% reduction** in callback recreations
- **30% improvement** in template rendering
- **Significantly smoother** camera interactions and zoom operations

### Memory Usage
- **Reduced memory consumption** with optimized FlatList
- **Better garbage collection** with memoized components
- **Efficient image loading** with caching and progressive rendering

### User Experience
- **Smoother animations** with optimized re-renders
- **Faster scrolling** in gallery with large photo lists
- **Responsive camera controls** with memoized callbacks
- **Efficient template rendering** with memoized components

## 🎯 Future Optimizations

### Potential Areas
1. **Image lazy loading** for gallery thumbnails
2. **Virtual scrolling** for very large lists
3. **WebP image format** for better compression
4. **Code splitting** for better initial load times
5. **Service worker** for offline functionality

### Monitoring
- **Performance budgets** for new features
- **Regular performance audits** with measurement tools
- **User experience metrics** for optimization validation
- **Memory leak detection** with profiling tools

---

This guide should be updated as new performance optimizations are implemented and new best practices are discovered.
