# Template System Documentation

The Template System is a comprehensive architecture for managing camera overlay templates in PixAssist. It provides a scalable foundation for both core and pro templates with live previews, state management, and precise camera alignment.

## 📁 Architecture Overview

```
templates/
├── core/                    # Core template system
│   ├── components/          # Visual template components
│   │   └── RuleOfThirds.tsx # Rule of Thirds grid overlay
│   ├── types.ts            # Core template type definitions
│   └── index.ts            # Core template exports
├── manager/                 # State management layer
│   ├── TemplateManager.ts  # Main template service
│   └── TemplateStorage.ts  # Storage service
├── hooks/                   # Template system hooks
│   └── useTemplates.ts     # Main template hook
└── types/                   # Shared type definitions
    └── index.ts            # Template type definitions
```

## 🎯 Core Components

### Template System Components
Located in `app/components/TemplateDrawer/`:

- **`TemplateDrawer.tsx`** - Main slide-in drawer container
- **`TemplateCarousel.tsx`** - Horizontal scrollable template previews
- **`TemplatePreviewCard.tsx`** - Individual template preview with live rendering
- **`TemplateOverlay.tsx`** - Live template overlay on camera view

### Template Visual Components
Located in `app/templates/core/components/`:

- **`RuleOfThirds.tsx`** - Rule of Thirds grid overlay template

## 🔧 State Management

### TemplateManager Service
**Location**: `app/templates/manager/TemplateManager.ts`

Central service for managing template state and operations.

```typescript
import { TemplateManager } from '@/templates/manager/TemplateManager'

const templateManager = new TemplateManager()

// Available methods
templateManager.getAvailableTemplates()
templateManager.getActiveTemplates()
templateManager.activateTemplate(templateId)
templateManager.deactivateTemplate(templateId)
templateManager.getTemplateById(templateId)
```

**Features**:
- **Template registration**: Add new templates to the system
- **State management**: Track active/inactive templates
- **Template lookup**: Find templates by ID
- **Storage integration**: Persist template preferences

### TemplateStorage Service
**Location**: `app/templates/manager/TemplateStorage.ts`

Handles template data persistence and retrieval.

```typescript
import { TemplateStorage } from '@/templates/manager/TemplateStorage'

const storage = new TemplateStorage()

// Available methods
storage.saveActiveTemplates(templates)
storage.loadActiveTemplates()
storage.saveCurrentCategory(category)
storage.loadCurrentCategory()
```

**Features**:
- **Async storage**: Non-blocking data persistence
- **Error handling**: Graceful fallbacks for storage failures
- **Type safety**: Fully typed storage operations
- **Performance optimized**: Efficient data serialization

## 🎣 Hooks

### useTemplates Hook
**Location**: `app/templates/hooks/useTemplates.ts`

Main React hook for consuming template state and operations.

```typescript
import { useTemplates } from '@/templates/hooks/useTemplates'

const {
  templates,
  selectedTemplateId,
  currentCategory,
  setCurrentTemplate,
  setCurrentCategory,
  getTemplateById
} = useTemplates()
```

**Features**:
- **Reactive state**: Real-time template updates
- **Category management**: Core vs Pro template switching
- **Template selection**: Select and activate templates
- **State persistence**: Automatic storage integration

## 📐 Sizing and Alignment

### Camera Viewfinder Hook
**Location**: `app/hooks/useCameraViewfinder.ts`

Essential for precise template alignment and sizing.

```typescript
import { useCameraViewfinder } from '@/hooks/useCameraViewfinder'

const viewfinder = useCameraViewfinder()
// Returns: { width, height, x, y, aspectRatio, blackBars }
```

**Key Features**:
- **Empirically determined**: 82% of screen height for viewfinder area
- **Perfect alignment**: Accounts for camera's `resizeMode="contain"` behavior
- **Comprehensive data**: Includes black bar calculations and aspect ratios
- **Performance optimized**: Memoized calculations

**Documentation**: See [useCameraViewfinder.md](../hooks/useCameraViewfinder.md) for detailed usage patterns

### Compressed Sizing Pattern

For UI elements that need to fit within the viewfinder area with padding:

```typescript
// ✅ BEST PRACTICE: Uniform compression with transform scale
<View style={{
  width: viewfinder.width,        // Full viewfinder width
  height: viewfinder.height,      // Full viewfinder height
  transform: [{ scale: 0.95 }],   // 5% uniform compression
  // ... other styles
}}>
  {/* Content scales proportionally */}
</View>
```

**Benefits**:
- **Uniform compression** - maintains aspect ratio perfectly
- **No compounding effects** - single transformation vs width/height multiplication
- **Proportional scaling** - all internal elements scale together
- **Clean calculations** - easy to adjust compression percentage

## 🎨 Template Development

### Creating New Core Templates

1. **Define template types** in `app/templates/core/types.ts`:

```typescript
export interface CoreTemplate {
  id: string
  name: string
  category: 'grid' | 'level' | 'guide' | 'frame'
  component: React.ComponentType<CoreTemplateProps>
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
}

export interface CoreTemplateProps {
  isActive: boolean
  opacity: number
  color: string
  size: 'small' | 'medium' | 'large'
  screenDimensions: { width: number; height: number }
}
```

2. **Create template component** in `app/templates/core/components/`:

```typescript
import React from 'react'
import { View, ViewStyle } from 'react-native'
import { CoreTemplateProps } from '../types'

export const MyTemplate: React.FC<CoreTemplateProps> = React.memo(({
  isActive,
  opacity,
  color,
  size,
  screenDimensions
}) => {
  if (!isActive) return null

  const { width, height } = screenDimensions

  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: width, 
      height: height 
    }}>
      {/* Template content */}
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

MyTemplate.displayName = 'MyTemplate'
```

3. **Register in TemplateManager** in `app/templates/manager/TemplateManager.ts`:

```typescript
import { MyTemplate } from '../core/components/MyTemplate'

// Add to templates array
const templates: Template[] = [
  // ... existing templates
  {
    id: 'my-template',
    name: 'My Template',
    category: 'guide',
    type: 'core',
    component: MyTemplate,
    isActive: false,
    opacity: 0.6,
    color: '#ffffff',
    size: 'medium'
  }
]
```

4. **Export from core index** in `app/templates/core/index.ts`:

```typescript
export { MyTemplate } from './components/MyTemplate'
```

### Template Component Best Practices

1. **Use React.memo**: Optimize performance with custom comparison functions
2. **Handle inactive state**: Return `null` when `isActive` is false
3. **Use screenDimensions**: Always use the provided dimensions for sizing
4. **Position absolutely**: Use `position: 'absolute'` for overlay positioning
5. **Include displayName**: Set component display name for debugging

### Performance Optimization

- **Memoization**: Use `React.memo` with custom comparison functions
- **Efficient rendering**: Only render when `isActive` is true
- **Optimized calculations**: Cache expensive calculations
- **Minimal re-renders**: Avoid unnecessary state updates

## 🎯 Usage Examples

### Basic Template Selection

```typescript
import { useTemplates } from '@/templates/hooks/useTemplates'
import { TemplateDrawer } from '@/components/TemplateDrawer'

const CameraScreen = () => {
  const { templates, selectedTemplateId, setCurrentTemplate } = useTemplates()
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setCurrentTemplate(templateId)
    setIsDrawerVisible(false)
  }

  return (
    <View>
      {/* Camera view */}
      <CameraView />
      
      {/* Template overlay */}
      {selectedTemplateId && (
        <TemplateOverlay templateId={selectedTemplateId} />
      )}
      
      {/* Template drawer */}
      <TemplateDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        onTemplateSelect={handleTemplateSelect}
      />
    </View>
  )
}
```

### Custom Template Integration

```typescript
import { useCameraViewfinder } from '@/hooks/useCameraViewfinder'
import { MyTemplate } from '@/templates/core'

const MyComponent = () => {
  const viewfinder = useCameraViewfinder()

  return (
    <MyTemplate
      isActive={true}
      opacity={0.8}
      color="#ffffff"
      size="medium"
      screenDimensions={{
        width: viewfinder.width,
        height: viewfinder.height
      }}
    />
  )
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Template not rendering**: Check if `isActive` is true
2. **Wrong positioning**: Verify `screenDimensions` usage
3. **Performance issues**: Ensure proper memoization
4. **State not persisting**: Check TemplateStorage integration

### Debug Tips

- Use React DevTools to inspect template state
- Add console logs to track template lifecycle
- Check viewfinder dimensions with `logCameraViewfinder()`
- Verify template registration in TemplateManager

## 📚 Additional Resources

- [Camera Viewfinder Hook Guide](../hooks/useCameraViewfinder.md)
- [Template System Implementation Guide](../../TEMPLATE_SYSTEM_IMPLEMENTATION.md)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [React Native Performance](https://reactnative.dev/docs/performance)
