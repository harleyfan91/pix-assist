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

### Core Template Components

```typescript
// app/templates/core/components/RuleOfThirds.tsx
import React from 'react'
import { View, ViewStyle } from 'react-native'
import { CoreTemplateProps } from '../types'

export const RuleOfThirds: React.FC<CoreTemplateProps> = ({
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
}
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

### Pro Template Components

```typescript
// app/templates/pro/components/PortraitGrid.tsx
import React from 'react'
import { View } from 'react-native'
import Svg, { Line, Text as SvgText } from 'react-native-svg'
import { ProTemplateProps } from '../types'

export const PortraitGrid: React.FC<ProTemplateProps> = ({
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
}
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

## 🎣 **React Hooks Integration**

### Main Template Hook

```typescript
// app/templates/hooks/useTemplates.ts
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTemplates, setActiveTemplates] = useState<string[]>([])
  const [currentCategory, setCurrentCategory] = useState<TemplateCategory>('core')
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadTemplates()
  }, [])
  
  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const available = await TemplateManager.getAvailableTemplates()
      const active = await TemplateManager.getActiveTemplates()
      const category = await TemplateManager.getCurrentCategory()
      const currentIndex = await TemplateManager.getCurrentTemplateIndex()
      
      setTemplates(available)
      setActiveTemplates(active)
      setCurrentCategory(category)
      setCurrentTemplateIndex(currentIndex)
    } finally {
      setIsLoading(false)
    }
  }
  
  const switchCategory = async (category: TemplateCategory) => {
    await TemplateManager.setCurrentCategory(category)
    setCurrentCategory(category)
    setCurrentTemplateIndex(0) // Reset to first template in category
  }
  
  const getCurrentCategoryTemplates = (): Template[] => {
    return activeTemplates
      .map(id => templates.find(t => t.id === id))
      .filter(template => template?.category === currentCategory)
      .filter(Boolean) as Template[]
  }
  
  const getCurrentTemplate = (): Template | null => {
    const categoryTemplates = getCurrentCategoryTemplates()
    if (categoryTemplates.length === 0) return null
    return categoryTemplates[currentTemplateIndex] || null
  }
  
  const switchToTemplate = async (index: number) => {
    const categoryTemplates = getCurrentCategoryTemplates()
    if (index >= 0 && index < categoryTemplates.length) {
      await TemplateManager.setCurrentTemplateIndex(index)
      setCurrentTemplateIndex(index)
    }
  }
  
  const addTemplateToActive = async (templateId: string) => {
    await TemplateManager.activateTemplate(templateId)
    loadTemplates()
  }
  
  const removeTemplateFromActive = async (templateId: string) => {
    await TemplateManager.deactivateTemplate(templateId)
    loadTemplates()
  }
  
  return {
    templates,
    activeTemplates,
    currentCategory,
    currentTemplateIndex,
    isLoading,
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

### Real-Time Template Switching

```typescript
// In CameraScreen.tsx - Updated approach
const { 
  templates, 
  activeTemplates, 
  currentCategory, 
  setCurrentCategory,
  currentTemplateIndex, 
  setCurrentTemplateIndex,
  getCurrentCategoryTemplates,
  switchToTemplate
} = useTemplates()

const [isTemplateSwiping, setIsTemplateSwiping] = useState(false)

// Get templates for current category only
const currentCategoryTemplates = getCurrentCategoryTemplates()

// Swipe gesture for template switching within category
const templateSwipeGesture = Gesture.Pan()
  .onBegin(() => {
    'worklet'
    runOnJS(setIsTemplateSwiping)(true)
  })
  .onUpdate((event) => {
    'worklet'
    // Only respond to horizontal swipes
    if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
      const swipeThreshold = 50
      const newIndex = Math.max(0, Math.min(
        currentCategoryTemplates.length - 1,
        currentTemplateIndex + Math.round(event.translationX / swipeThreshold)
      ))
      
      if (newIndex !== currentTemplateIndex) {
        runOnJS(switchToTemplate)(newIndex)
      }
    }
  })
  .onEnd(() => {
    'worklet'
    runOnJS(setIsTemplateSwiping)(false)
  })

// Combine with existing camera gestures
const cameraGestures = Gesture.Simultaneous(
  tapGesture,
  pinchGesture,
  templateSwipeGesture
)

// Render only current category templates
{currentCategoryTemplates.map((template, index) => {
  if (!template) return null
  
  const isActive = index === currentTemplateIndex
  const opacity = isActive ? 1 : 0
  
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
})}
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

### Template Swipe Indicator

```typescript
// app/components/TemplateSwipeIndicator.tsx
export const TemplateSwipeIndicator: FC<{
  currentCategoryTemplates: Template[]
  currentIndex: number
  onTemplateSelect: (index: number) => void
}> = ({ currentCategoryTemplates, currentIndex, onTemplateSelect }) => {
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
}

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
- [ ] Set up basic template manager with category support
- [ ] Create template storage service
- [ ] Build core template components

### **Phase 2: Pro Templates**
- [ ] Implement SVG-based pro template system
- [ ] Create template downloader service
- [ ] Build template validation system
- [ ] Implement caching mechanism
- [ ] Create pro template components

### **Phase 3: Category-Based Rendering**
- [ ] Implement category switching system
- [ ] Add template transition animations
- [ ] Create category switcher UI
- [ ] Implement swipe gesture for template switching within category
- [ ] Add template swipe indicator UI

### **Phase 4: Integration & Polish**
- [ ] Integrate with CameraScreen
- [ ] Build TemplatesScreen UI
- [ ] Implement template customization options
- [ ] Create template preview system
- [ ] Add template categories and filtering

### **Phase 5: Advanced Features**
- [ ] Implement template updates system
- [ ] Add template sharing system
- [ ] Build template analytics
- [ ] Implement template backup/restore
- [ ] Performance optimization

## 💡 **Key Benefits**

1. **Performance**: Category-based rendering reduces memory usage
2. **Real-Time Switching**: Smooth swipe gestures for instant feedback
3. **Scalable**: Easy to add new templates and categories
4. **Efficient**: Multi-tier caching system
5. **User-Friendly**: Intuitive gestures and clear visual indicators
6. **Future-Proof**: Built for easy updates and expansion

## 🔧 **Technical Considerations**

- **Memory Management**: Only render templates in current category
- **Gesture Handling**: Swipe detection doesn't interfere with camera controls
- **State Persistence**: Remember category and template selections
- **Error Handling**: Graceful fallbacks for failed downloads
- **Offline Support**: Core templates always available offline

## 📦 **Dependencies**

- `react-native-svg` - For pro template SVG rendering
- `react-native-gesture-handler` - For swipe gestures
- `react-native-reanimated` - For smooth animations
- `react-native-mmkv` - For local storage
- `@gluestack-ui/themed` - For UI components

## 🎯 **Success Metrics**

- Template switching response time < 200ms
- Memory usage < 50MB for template system
- Smooth 60fps animations
- Offline functionality for core templates
- User satisfaction with gesture responsiveness

---

**Note**: This implementation guide should be referenced throughout the development process to ensure consistency and completeness of the template system.
