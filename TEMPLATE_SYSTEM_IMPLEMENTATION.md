# Template System Implementation Guide

> **PixAssist Overlay Template System** - A comprehensive guide for implementing real-time camera overlay templates with category-based rendering and performance optimization.

## 🎯 **System Overview**

The template system provides a hybrid approach supporting both:
- **Core Templates**: React Native View-based overlays (rule of thirds, level indicators)
- **Pro Templates**: Custom SVG overlays with advanced features

**Key Features:**
- Real-time template switching with swipe gestures
- Category-based rendering for optimal performance
- Multi-tier caching system
- Smooth animations and transitions
- Offline support for core templates
- Downloadable pro template library

## 📁 **Directory Structure**

```
app/
├── templates/
│   ├── core/                    # Core templates (React Native Views)
│   │   ├── components/          # Individual template components
│   │   │   ├── RuleOfThirds.tsx
│   │   │   ├── LevelIndicator.tsx
│   │   │   ├── CenterCrosshair.tsx
│   │   │   └── GoldenRatio.tsx
│   │   ├── index.ts            # Core template exports
│   │   └── types.ts            # Core template types
│   ├── pro/                    # Pro templates (SVG-based)
│   │   ├── components/         # SVG template components
│   │   │   ├── PortraitGrid.tsx
│   │   │   ├── ArchitectureGrid.tsx
│   │   │   └── CustomOverlay.tsx
│   │   ├── assets/            # SVG files and assets
│   │   │   ├── grids/
│   │   │   ├── frames/
│   │   │   └── guides/
│   │   ├── index.ts           # Pro template exports
│   │   └── types.ts           # Pro template types
│   ├── manager/               # Template management system
│   │   ├── TemplateManager.ts # Main template service
│   │   ├── TemplateCache.ts   # Caching logic
│   │   ├── TemplateDownloader.ts # Download/update logic
│   │   └── types.ts           # Manager types
│   ├── hooks/                 # React hooks for templates
│   │   ├── useTemplates.ts    # Main template hook
│   │   ├── useTemplateCache.ts # Cache management hook
│   │   └── useTemplateDownload.ts # Download hook
│   ├── services/              # Template services
│   │   ├── templateApi.ts     # API for template updates
│   │   ├── templateStorage.ts # Local storage management
│   │   └── templateValidation.ts # Template validation
│   └── types/                 # Shared template types
│       ├── core.ts
│       ├── pro.ts
│       └── index.ts
```

## 🎨 **Core Template System**

### Core Template Types

```typescript
// app/templates/core/types.ts
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

### Core Template Components (Optimized)

```typescript
// app/templates/core/components/RuleOfThirds.tsx
import React from 'react'
import { View, ViewStyle } from 'react-native'
import { CoreTemplateProps } from '../types'

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

  const $verticalLine: ViewStyle = {
    position: 'absolute',
    width: 1,
    height: height,
    backgroundColor: color,
    opacity: lineOpacity,
  }

  const $horizontalLine: ViewStyle = {
    position: 'absolute',
    width: width,
    height: 1,
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
  // Custom comparison for performance
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
```

## 🎨 **Pro Template System**

### Pro Template Types

```typescript
// app/templates/pro/types.ts
export interface ProTemplate {
  id: string
  name: string
  category: 'grid' | 'frame' | 'guide' | 'custom'
  svgComponent: React.ComponentType<ProTemplateProps>
  svgData?: string // Cached SVG string
  isDownloaded: boolean
  isPremium: boolean
  version: string
  lastUpdated: string
  fileSize: number
  customization: ProTemplateCustomization
}

export interface ProTemplateCustomization {
  colors: string[]
  opacity: number
  scale: number
  rotation: number
  showLabels: boolean
  customText?: string
}

export interface ProTemplateProps {
  customization: ProTemplateCustomization
  screenDimensions: { width: number; height: number }
}
```

### Pro Template Components (Optimized)

```typescript
// app/templates/pro/components/PortraitGrid.tsx
import React from 'react'
import { View } from 'react-native'
import Svg, { Line, Text as SvgText } from 'react-native-svg'
import { ProTemplateProps } from '../types'

// Memoized for performance optimization
export const PortraitGrid: React.FC<ProTemplateProps> = React.memo(({
  customization,
  screenDimensions
}) => {
  const { width, height } = screenDimensions
  const { colors, opacity, scale, showLabels } = customization

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        <Line
          x1={width / 3}
          y1={0}
          x2={width / 3}
          y2={height}
          stroke={colors[0]}
          strokeWidth={1}
          opacity={opacity}
        />
        <Line
          x1={(width * 2) / 3}
          y1={0}
          x2={(width * 2) / 3}
          y2={height}
          stroke={colors[0]}
          strokeWidth={1}
          opacity={opacity}
        />
        <Line
          x1={0}
          y1={height / 3}
          x2={width}
          y2={height / 3}
          stroke={colors[0]}
          strokeWidth={1}
          opacity={opacity}
        />
        <Line
          x1={0}
          y1={(height * 2) / 3}
          x2={width}
          y2={(height * 2) / 3}
          stroke={colors[0]}
          strokeWidth={1}
          opacity={opacity}
        />
        
        {/* Labels */}
        {showLabels && (
          <>
            <SvgText
              x={width / 6}
              y={height / 6}
              fontSize={12}
              fill={colors[0]}
              opacity={opacity}
            >
              Portrait
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  )
}, (prevProps, nextProps) => {
  // Deep comparison for customization changes
  return (
    JSON.stringify(prevProps.customization) === JSON.stringify(nextProps.customization) &&
    prevProps.screenDimensions.width === nextProps.screenDimensions.width &&
    prevProps.screenDimensions.height === nextProps.screenDimensions.height
  )
})

PortraitGrid.displayName = 'PortraitGrid'
```

## 💾 **Storage & Caching Strategy**

### Multi-Tier Caching System

```typescript
// app/templates/manager/TemplateCache.ts
export class TemplateCache {
  private memoryCache = new Map<string, Template>()
  private maxMemoryItems = 10
  
  async getTemplate(id: string): Promise<Template | null> {
    // 1. Check memory cache
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!
    }
    
    // 2. Check local storage
    const local = await this.getFromLocalStorage(id)
    if (local) {
      this.addToMemoryCache(local)
      return local
    }
    
    // 3. Download if pro template
    if (id.startsWith('pro_')) {
      return await this.downloadTemplate(id)
    }
    
    return null
  }
  
  private addToMemoryCache(template: Template) {
    if (this.memoryCache.size >= this.maxMemoryItems) {
      // Remove oldest item
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }
    this.memoryCache.set(template.id, template)
  }
  
  private async getFromLocalStorage(id: string): Promise<Template | null> {
    try {
      const stored = await storage.load(`template_${id}`)
      return stored as Template
    } catch {
      return null
    }
  }
  
  private async saveToLocalStorage(template: Template): Promise<void> {
    await storage.save(`template_${template.id}`, template)
  }
}
```

## 🔄 **Update & Download System**

### Smart Update Mechanism

```typescript
// app/templates/manager/TemplateDownloader.ts
export class TemplateDownloader {
  async checkForUpdates(): Promise<TemplateUpdate[]> {
    const response = await this.api.getTemplateManifest()
    const localVersions = await this.getLocalVersions()
    
    return response.templates
      .filter(remote => {
        const local = localVersions.find(l => l.id === remote.id)
        return !local || this.isNewerVersion(remote.version, local.version)
      })
  }
  
  async downloadTemplate(templateId: string): Promise<Template> {
    // Download with progress tracking
    const template = await this.api.downloadTemplate(templateId, (progress) => {
      this.updateDownloadProgress(templateId, progress)
    })
    
    // Validate and cache
    await this.validateTemplate(template)
    await this.cacheTemplate(template)
    
    return template
  }
  
  private isNewerVersion(remoteVersion: string, localVersion: string): boolean {
    // Simple version comparison (can be enhanced)
    return remoteVersion > localVersion
  }
}
```

## 🎛️ **Template Manager Service**

### Centralized Template Management

```typescript
// app/templates/manager/TemplateManager.ts
export class TemplateManager {
  private cache: TemplateCache
  private downloader: TemplateDownloader
  private activeTemplates: string[] = []
  private currentCategory: TemplateCategory = 'core'
  private currentTemplateIndex = 0
  
  async initialize() {
    // Load core templates
    await this.loadCoreTemplates()
    
    // Check for pro template updates
    await this.checkForUpdates()
    
    // Preload frequently used templates
    await this.preloadPopularTemplates()
  }
  
  async getAvailableTemplates(): Promise<Template[]> {
    const core = await this.getCoreTemplates()
    const pro = await this.getProTemplates()
    return [...core, ...pro]
  }
  
  async getCurrentCategory(): Promise<TemplateCategory> {
    return this.currentCategory
  }
  
  async setCurrentCategory(category: TemplateCategory): Promise<void> {
    this.currentCategory = category
    this.currentTemplateIndex = 0 // Reset to first template in category
    await this.saveCurrentCategory()
    await this.saveCurrentTemplateIndex()
  }
  
  getActiveTemplatesForCategory(): string[] {
    return this.activeTemplates.filter(templateId => {
      const template = this.templates.find(t => t.id === templateId)
      return template?.category === this.currentCategory
    })
  }
  
  async activateTemplate(templateId: string): Promise<void> {
    const template = await this.cache.getTemplate(templateId)
    if (template) {
      this.activeTemplates.push(templateId)
      await this.saveActiveTemplates()
    }
  }
  
  async deactivateTemplate(templateId: string): Promise<void> {
    const index = this.activeTemplates.indexOf(templateId)
    if (index > -1) {
      this.activeTemplates.splice(index, 1)
      // Adjust current index if needed
      const categoryTemplates = this.getActiveTemplatesForCategory()
      if (this.currentTemplateIndex >= categoryTemplates.length) {
        this.currentTemplateIndex = Math.max(0, categoryTemplates.length - 1)
      }
      await this.saveActiveTemplates()
      await this.saveCurrentTemplateIndex()
    }
  }
}
```

## 🎛️ **Template State Management**

### Robust State Management with Reducer

```typescript
// app/templates/hooks/templateReducer.ts
export interface TemplateState {
  templates: Template[]
  activeTemplates: string[]
  currentCategory: TemplateCategory
  currentTemplateIndex: number
  isLoading: boolean
  error: string | null
}

export type TemplateAction =
  | { type: 'SET_TEMPLATES'; templates: Template[] }
  | { type: 'SET_ACTIVE_TEMPLATES'; activeTemplates: string[] }
  | { type: 'SWITCH_CATEGORY'; category: TemplateCategory }
  | { type: 'SWITCH_TEMPLATE'; index: number }
  | { type: 'ADD_TEMPLATE'; templateId: string }
  | { type: 'REMOVE_TEMPLATE'; templateId: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }

export const templateReducer = (state: TemplateState, action: TemplateAction): TemplateState => {
  switch (action.type) {
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates, isLoading: false }
    
    case 'SET_ACTIVE_TEMPLATES':
      return { ...state, activeTemplates: action.activeTemplates }
    
    case 'SWITCH_CATEGORY':
      return {
        ...state,
        currentCategory: action.category,
        currentTemplateIndex: 0, // Reset to first template in new category
        error: null
      }
    
    case 'SWITCH_TEMPLATE':
      return { ...state, currentTemplateIndex: action.index }
    
    case 'ADD_TEMPLATE':
      if (state.activeTemplates.includes(action.templateId)) {
        return state
      }
      return {
        ...state,
        activeTemplates: [...state.activeTemplates, action.templateId]
      }
    
    case 'REMOVE_TEMPLATE':
      const newActiveTemplates = state.activeTemplates.filter(id => id !== action.templateId)
      const categoryTemplates = newActiveTemplates.filter(templateId => {
        const template = state.templates.find(t => t.id === templateId)
        return template?.category === state.currentCategory
      })
      
      return {
        ...state,
        activeTemplates: newActiveTemplates,
        currentTemplateIndex: Math.min(state.currentTemplateIndex, Math.max(0, categoryTemplates.length - 1))
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false }
    
    default:
      return state
  }
}
```

## 🎣 **React Hooks Integration**

### Main Template Hook (Enhanced with Reducer)

```typescript
// app/templates/hooks/useTemplates.ts
import { useReducer, useEffect, useCallback } from 'react'
import { templateReducer, TemplateState } from './templateReducer'

const initialState: TemplateState = {
  templates: [],
  activeTemplates: [],
  currentCategory: 'core',
  currentTemplateIndex: 0,
  isLoading: true,
  error: null
}

export function useTemplates() {
  const [state, dispatch] = useReducer(templateReducer, initialState)
  
  useEffect(() => {
    loadTemplates()
  }, [])
  
  const loadTemplates = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true })
    try {
      const available = await TemplateManager.getAvailableTemplates()
      const active = await TemplateManager.getActiveTemplates()
      const category = await TemplateManager.getCurrentCategory()
      const currentIndex = await TemplateManager.getCurrentTemplateIndex()
      
      dispatch({ type: 'SET_TEMPLATES', templates: available })
      dispatch({ type: 'SET_ACTIVE_TEMPLATES', activeTemplates: active })
      dispatch({ type: 'SWITCH_CATEGORY', category })
      dispatch({ type: 'SWITCH_TEMPLATE', index: currentIndex })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
    }
  }, [])
  
  const switchCategory = useCallback(async (category: TemplateCategory) => {
    try {
      await TemplateManager.setCurrentCategory(category)
      dispatch({ type: 'SWITCH_CATEGORY', category })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
    }
  }, [])
  
  const getCurrentCategoryTemplates = useCallback((): Template[] => {
    return state.activeTemplates
      .map(id => state.templates.find(t => t.id === id))
      .filter(template => template?.category === state.currentCategory)
      .filter(Boolean) as Template[]
  }, [state.templates, state.activeTemplates, state.currentCategory])
  
  const getCurrentTemplate = useCallback((): Template | null => {
    const categoryTemplates = getCurrentCategoryTemplates()
    if (categoryTemplates.length === 0) return null
    return categoryTemplates[state.currentTemplateIndex] || null
  }, [getCurrentCategoryTemplates, state.currentTemplateIndex])
  
  const switchToTemplate = useCallback(async (index: number) => {
    const categoryTemplates = getCurrentCategoryTemplates()
    if (index >= 0 && index < categoryTemplates.length) {
      try {
        await TemplateManager.setCurrentTemplateIndex(index)
        dispatch({ type: 'SWITCH_TEMPLATE', index })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', error: error.message })
      }
    }
  }, [getCurrentCategoryTemplates])
  
  const addTemplateToActive = useCallback(async (templateId: string) => {
    try {
      await TemplateManager.activateTemplate(templateId)
      dispatch({ type: 'ADD_TEMPLATE', templateId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
    }
  }, [])
  
  const removeTemplateFromActive = useCallback(async (templateId: string) => {
    try {
      await TemplateManager.deactivateTemplate(templateId)
      dispatch({ type: 'REMOVE_TEMPLATE', templateId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
    }
  }, [])
  
  return {
    ...state,
    switchCategory,
    getCurrentCategoryTemplates,
    getCurrentTemplate,
    switchToTemplate,
    addTemplateToActive,
    removeTemplateFromActive,
    refreshTemplates: loadTemplates
  }
}
```

## 📱 **Camera Integration**

### Real-Time Template Switching with Enhanced Gesture Handling

```typescript
// In CameraScreen.tsx - Enhanced gesture conflict prevention
const { 
  templates, 
  activeTemplates, 
  currentCategory, 
  switchCategory,
  currentTemplateIndex, 
  switchToTemplate,
  getCurrentCategoryTemplates,
  error
} = useTemplates()

const [isTemplateSwiping, setIsTemplateSwiping] = useState(false)

// Get templates for current category only
const currentCategoryTemplates = getCurrentCategoryTemplates()

// Enhanced swipe gesture with conflict prevention
const templateSwipeGesture = Gesture.Pan()
  .runOnJS(true)
  .simultaneousWithExternalGesture(cameraGesture) // Allow simultaneous gestures
  .failOffsetX([-15, 15]) // Only respond to significant horizontal movement
  .failOffsetY([-30, 30]) // Allow some vertical tolerance
  .minDistance(20) // Prevent accidental triggers
  .onBegin(() => {
    'worklet'
    runOnJS(setIsTemplateSwiping)(true)
  })
  .onUpdate((event) => {
    'worklet'
    // Enhanced horizontal swipe detection
    const horizontalMovement = Math.abs(event.translationX)
    const verticalMovement = Math.abs(event.translationY)
    
    // Only process if horizontal movement is dominant
    if (horizontalMovement > verticalMovement && horizontalMovement > 20) {
      const swipeThreshold = 60
      const direction = event.translationX > 0 ? -1 : 1 // Swipe right = previous, left = next
      const newIndex = Math.max(0, Math.min(
        currentCategoryTemplates.length - 1,
        currentTemplateIndex + direction
      ))
      
      if (newIndex !== currentTemplateIndex && Math.abs(event.translationX) > swipeThreshold) {
        runOnJS(switchToTemplate)(newIndex)
      }
    }
  })
  .onEnd(() => {
    'worklet'
    runOnJS(setIsTemplateSwiping)(false)
  })

// Combine with existing camera gestures using Simultaneous
const cameraGestures = Gesture.Simultaneous(
  tapGesture,
  pinchGesture,
  templateSwipeGesture
)

// Error handling wrapper for template rendering
const renderTemplate = useCallback((template: Template, index: number) => {
  if (!template) return null
  
  const isActive = index === currentTemplateIndex
  const opacity = isActive ? 1 : 0
  
  try {
    if (template.type === 'core') {
      const CoreComponent = template.component
      return (
        <Animated.View
          key={template.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: withTiming(opacity, { duration: 200 }),
            pointerEvents: 'none'
          }}
        >
          <CoreComponent
            isActive={isActive}
            opacity={template.opacity}
            color={template.color}
            size={template.size}
            screenDimensions={{ width, height }}
          />
        </Animated.View>
      )
    } else {
      const ProComponent = template.svgComponent
      return (
        <Animated.View
          key={template.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: withTiming(opacity, { duration: 200 }),
            pointerEvents: 'none'
          }}
        >
          <ProComponent
            customization={template.customization}
            screenDimensions={{ width, height }}
          />
        </Animated.View>
      )
    }
  } catch (renderError) {
    // Fallback to basic rule of thirds on render error
    console.warn(`Template ${template.id} failed to render:`, renderError)
    return (
      <Animated.View
        key={`${template.id}-fallback`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: withTiming(opacity, { duration: 200 }),
          pointerEvents: 'none'
        }}
      >
        <RuleOfThirds
          isActive={isActive}
          opacity={0.6}
          color="#ffffff"
          size="medium"
          screenDimensions={{ width, height }}
        />
      </Animated.View>
    )
  }
}, [currentTemplateIndex, width, height])

// Render only current category templates with error handling
{currentCategoryTemplates.map(renderTemplate)}

{/* Error display */}
{error && (
  <View style={$errorContainer}>
    <Text style={$errorText}>Template Error: {error}</Text>
  </View>
)}
```

## 🎨 **UI Components**

### Category Switcher

```typescript
// app/components/TemplateCategorySwitcher.tsx
export const TemplateCategorySwitcher: FC<{
  currentCategory: TemplateCategory
  onCategoryChange: (category: TemplateCategory) => void
  availableCategories: TemplateCategory[]
}> = ({ currentCategory, onCategoryChange, availableCategories }) => {
  return (
    <View style={$categorySwitcher}>
      {availableCategories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            $categoryButton,
            currentCategory === category && $activeCategoryButton
          ]}
          onPress={() => onCategoryChange(category)}
        >
          <Text style={[
            $categoryButtonText,
            currentCategory === category && $activeCategoryButtonText
          ]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const $categorySwitcher: ViewStyle = {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingVertical: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 25,
  marginHorizontal: 20,
  marginTop: 20,
}

const $categoryButton: ViewStyle = {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  alignItems: 'center',
}

const $activeCategoryButton: ViewStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}

const $categoryButtonText: TextStyle = {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
}

const $activeCategoryButtonText: TextStyle = {
  fontWeight: 'bold',
}
```

### Template Swipe Indicator (Memoized)

```typescript
// app/components/TemplateSwipeIndicator.tsx
export const TemplateSwipeIndicator: FC<{
  currentCategoryTemplates: Template[]
  currentIndex: number
  onTemplateSelect: (index: number) => void
}> = React.memo(({ currentCategoryTemplates, currentIndex, onTemplateSelect }) => {
  if (currentCategoryTemplates.length <= 1) return null
  
  return (
    <View style={$swipeIndicator}>
      <Text style={$swipeHint}>Swipe to switch templates</Text>
      <View style={$templateDots}>
        {currentCategoryTemplates.map((template, index) => (
          <TouchableOpacity
            key={template.id}
            style={[
              $templateDot,
              index === currentIndex && $activeTemplateDot
            ]}
            onPress={() => onTemplateSelect(index)}
          />
        ))}
      </View>
    </View>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.currentCategoryTemplates.length === nextProps.currentCategoryTemplates.length &&
    prevProps.currentCategoryTemplates.every((template, index) => 
      template.id === nextProps.currentCategoryTemplates[index]?.id
    )
  )
})

TemplateSwipeIndicator.displayName = 'TemplateSwipeIndicator'

const $swipeIndicator: ViewStyle = {
  position: 'absolute',
  bottom: 120,
  left: 0,
  right: 0,
  alignItems: 'center',
  zIndex: 10,
}

const $swipeHint: TextStyle = {
  color: '#fff',
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 8,
}

const $templateDots: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
}

const $templateDot: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  marginHorizontal: 4,
}

const $activeTemplateDot: ViewStyle = {
  backgroundColor: '#fff',
  width: 12,
  height: 12,
  borderRadius: 6,
}
```

## 🚀 **Implementation Phases**

### **Phase 1: Foundation**
- [ ] Create template directory structure
- [ ] Implement core template system (Rule of Thirds, Level Indicator)
- [ ] Set up template state management with reducer pattern
- [ ] Create template storage service
- [ ] Build core template components with React.memo optimization
- [ ] Implement basic template manager with category support

### **Phase 2: Category-Based Rendering & Gestures**
- [ ] Implement category switching system
- [ ] Create enhanced gesture handling with conflict prevention
- [ ] Add template transition animations
- [ ] Create category switcher UI
- [ ] Implement swipe gesture for template switching within category
- [ ] Add template swipe indicator UI with memoization

### **Phase 3: Pro Templates**
- [ ] Implement SVG-based pro template system
- [ ] Create template downloader service
- [ ] Build template validation system
- [ ] Implement caching mechanism
- [ ] Create pro template components with performance optimization

### **Phase 4: Integration & Polish**
- [ ] Integrate with CameraScreen using enhanced gesture system
- [ ] Build TemplatesScreen UI
- [ ] Implement template customization options
- [ ] Create template preview system
- [ ] Add template categories and filtering
- [ ] Implement error handling and fallback rendering

### **Phase 5: Advanced Features**
- [ ] Implement template updates system
- [ ] Add template sharing system
- [ ] Build template analytics
- [ ] Implement template backup/restore
- [ ] Performance optimization and memory management
- [ ] Add accessibility features and reduced motion support

## 💡 **Key Benefits**

1. **Performance**: 
   - Category-based rendering reduces memory usage
   - React.memo optimization prevents unnecessary re-renders
   - Multi-tier caching system for efficient template loading

2. **Real-Time Switching**: 
   - Smooth swipe gestures with conflict prevention
   - Enhanced gesture detection for reliable interaction
   - Instant visual feedback with smooth animations

3. **Scalable Architecture**: 
   - Reducer pattern for predictable state management
   - Easy to add new templates and categories
   - Clean separation of concerns

4. **Robust Error Handling**: 
   - Graceful fallbacks for failed template renders
   - Comprehensive error states in reducer
   - User-friendly error messaging

5. **User-Friendly**: 
   - Intuitive gestures with proper conflict resolution
   - Clear visual indicators and feedback
   - Smooth transitions and animations

6. **Future-Proof**: 
   - Built for easy updates and expansion
   - Modular component architecture
   - Comprehensive state management system

## 🔧 **Technical Considerations**

### **Performance Optimizations**
- **Memory Management**: Only render templates in current category
- **React.memo**: Prevent unnecessary component re-renders
- **Gesture Optimization**: Enhanced conflict prevention with proper thresholds
- **State Management**: Reducer pattern for predictable updates
- **Error Boundaries**: Graceful handling of template render failures

### **Gesture Handling**
- **Conflict Prevention**: Simultaneous gesture recognition with proper failOffsets
- **Threshold Management**: Minimum distance requirements to prevent accidental triggers
- **Direction Detection**: Enhanced horizontal/vertical movement distinction
- **Performance**: Worklet-based gesture processing for 60fps

### **State Persistence**
- **Category Memory**: Remember category and template selections
- **Error Recovery**: Automatic fallback to working templates
- **Loading States**: Proper loading indicators during operations
- **Cache Management**: Efficient template caching and preloading

### **Error Handling**
- **Render Fallbacks**: Automatic fallback to basic templates on errors
- **Network Resilience**: Graceful handling of download failures
- **State Recovery**: Robust error states in reducer pattern
- **User Feedback**: Clear error messaging and recovery options

## 📦 **Dependencies**

- `react-native-svg` - For pro template SVG rendering
- `react-native-gesture-handler` - For enhanced swipe gestures
- `react-native-reanimated` - For smooth animations
- `react-native-mmkv` - For local storage
- `@gluestack-ui/themed` - For UI components

## 🎯 **Success Metrics**

- Template switching response time < 200ms
- Memory usage < 50MB for template system
- Smooth 60fps animations with enhanced gestures
- Zero gesture conflicts with camera controls
- < 5% error rate in template rendering
- Offline functionality for core templates
- User satisfaction with gesture responsiveness

## 🧪 **Testing Strategy**

### **Performance Testing**
- [ ] Template render time benchmarks
- [ ] Memory usage profiling during extended use
- [ ] Gesture response time measurements
- [ ] Animation frame rate monitoring

### **Gesture Testing**
- [ ] Conflict resolution between camera and template gestures
- [ ] Edge case handling (rapid swipes, multi-touch)
- [ ] Different screen sizes and orientations
- [ ] Accessibility gesture support

### **State Management Testing**
- [ ] Reducer action correctness
- [ ] State persistence across app restarts
- [ ] Error state recovery scenarios
- [ ] Concurrent state update handling

### **Error Handling Testing**
- [ ] Template render failure scenarios
- [ ] Network failure during downloads
- [ ] Corrupted template data handling
- [ ] Memory pressure situations

---

**Note**: This implementation guide should be referenced throughout the development process to ensure consistency and completeness of the template system. The enhanced architecture provides robust performance optimization, gesture handling, and state management for a production-ready camera overlay system.