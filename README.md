# PixAssist

> A React Native photo assistance app built with Ignite CLI, Gluestack UI, and Vision Camera

PixAssist is a modern React Native application that provides camera functionality and local photo management features. Built using the latest Ignite CLI boilerplate with custom integrations for enhanced UI components and camera capabilities.

## Features

- 📱 **Bottom Tab Navigation** - Easy access to Home, Camera, Gallery, and Settings
- 🎨 **Gluestack UI Integration** - Modern, accessible UI components with consistent theming
- 📷 **Advanced Camera Interface** - Full-screen camera with professional controls
- 🎛️ **Expandable Camera Controls** - iPhone-style camera mode button with smooth animations
- 📊 **Exposure Controls** - Vertical scrubber bar with Gluestack UI Slider
- 🎬 **Smooth Animations** - Spring-based animations with React Native Reanimated
- 👆 **Intuitive Gestures** - Tap, pinch, and pan gestures for camera interaction
- 🎯 **Click-Away UX** - Unified click-away system for all popup menus
- 📸 **Photo Preview & Management** - EXIF-based image rotation with smart caching
- 🔄 **Smart Image Processing** - Instant display with background processing
- 🗂️ **Three-Button Workflow** - Discard, Save, and Retouch functionality
- 🎨 **Retouch Screen** - Placeholder for future photo editing features
- 💾 **Local Storage** - Photos saved locally on device
- 🎨 **Blur Background Controls** - Modern blur effects for camera interface buttons
- 🌙 **Theme Support** - Light/dark mode theming
- 🌍 **Internationalization** - Multi-language support
- 📱 **Cross-Platform** - iOS and Android support
- 🎯 **Template System** - Live camera overlay templates with Rule of Thirds
- 📐 **Camera Viewfinder Hook** - Precise viewfinder area calculations for perfect alignment
- 🎨 **Template Drawer UI** - Smooth slide-in template selection with live previews
- 🔧 **Compressed Sizing Pattern** - Uniform scaling for UI elements within viewfinder area
- 🔴 **Visual Calibration System** - Red square debugging methodology for perfect overlay alignment

## Tech Stack

- **React Native 0.79.5** - Cross-platform mobile development
- **Expo SDK 53** - Development tools and services
- **Ignite CLI** - React Native boilerplate and tooling
- **Gluestack UI** - Modern UI component library with Slider components
- **Vision Camera** - Advanced camera functionality with exposure controls
- **React Native Reanimated** - Smooth spring animations and gestures
- **React Native Gesture Handler** - Advanced touch and gesture handling
- **React Navigation** - Navigation library
- **Expo Image Manipulator** - Professional image processing and rotation
- **Expo File System** - File management and cleanup
- **Expo Media Library** - Photo gallery integration
- **@lodev09/react-native-exify** - EXIF metadata reading and writing
- **@react-native-community/blur** - Blur effects for UI components
- **TypeScript** - Type-safe development

> 📋 **For detailed architecture information and dependency management policies, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Physical iOS device (for iOS development)
- Android device or Android Studio (for Android development)
- EAS CLI for builds

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PixAssist

# Install dependencies
npm install

# Start the development server
npm run start
```

### Building for Device

```bash
# Build for iOS device (development)
npm run build:ios:dev

# Build for iOS device (preview)
npm run build:ios:preview

# Build for iOS device (production)
npm run build:ios:prod
```

### Running the App

```bash
# Start Metro bundler (connects to your device via LAN)
npm run start

# Build and run on iOS device
npm run ios

# Build and run on Android device
npm run android

# Alternative: Use tunnel if LAN doesn't work
npm run start:tunnel
```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   └── TemplateDrawer/  # Template system UI components
│       ├── TemplateDrawer.tsx      # Main drawer container
│       ├── TemplateCarousel.tsx    # Horizontal scrollable templates
│       ├── TemplatePreviewCard.tsx # Individual template preview
│       └── TemplateOverlay.tsx     # Live overlay renderer
├── templates/           # Template system architecture
│   ├── core/            # Core template components
│   │   ├── components/  # Template visual components
│   │   │   └── RuleOfThirds.tsx # Rule of Thirds grid overlay
│   │   ├── types.ts     # Core template type definitions
│   │   └── index.ts     # Core template exports
│   ├── manager/         # Template state management
│   │   ├── TemplateManager.ts    # Template service class
│   │   └── TemplateStorage.ts    # Storage service
│   ├── hooks/           # Template system hooks
│   │   └── useTemplates.ts       # Main template hook
│   └── types/           # Shared template types
│       └── index.ts     # Template type definitions
├── hooks/               # Custom React hooks
│   ├── useCameraViewfinder.ts    # Camera viewfinder calculations
│   ├── useCameraAnimations.ts    # Camera animation controls
│   ├── useCameraControls.ts      # Camera control state
│   ├── useCameraGestures.ts      # Camera gesture handling
│   ├── useDeviceOrientation.ts   # Device orientation tracking
│   └── useIconRotation.ts        # Icon rotation animations
├── navigators/          # Navigation configuration
├── screens/            # App screens
│   ├── HomeScreen.tsx  # Welcome/home screen
│   ├── CameraScreen.tsx # Camera functionality with template system
│   ├── GalleryScreen.tsx # Photo gallery with media library integration
│   ├── PreviewScreen.tsx # Photo preview with EXIF rotation and smart caching
│   ├── RetouchScreen.tsx # Photo editing placeholder
│   └── SettingsScreen.tsx # App settings
├── services/           # Business logic and API services
│   ├── photoLibrary.ts # Media library service for photo management
│   └── exifService.ts  # EXIF metadata handling service
├── theme/              # Theme configuration and styling system
├── i18n/               # Internationalization
└── utils/              # Utility functions
```

## Current Implementation Status

### ✅ Completed
- [x] Ignite CLI boilerplate setup
- [x] Bottom tab navigation
- [x] Gluestack UI integration
- [x] Vision Camera integration
- [x] Camera permission handling
- [x] Advanced camera interface with iPhone-style layout
- [x] Expandable camera mode button with spring animations
- [x] Vertical exposure scrubber with Gluestack UI Slider
- [x] Smooth spring animations for all UI interactions
- [x] Unified click-away system for popup menus
- [x] Gesture-based camera controls (focus, zoom, exposure)
- [x] Templates screen with clean white background
- [x] Top navigation drawer with smooth animations
- [x] Photo capture functionality with proper file management
- [x] EXIF-based image rotation with smart caching system
- [x] Photo preview screen with three-button workflow
- [x] Photo gallery with media library integration
- [x] Retouch screen placeholder with navigation
- [x] Smart file cleanup and memory management
- [x] Exposure controls dependency on mode menu state
- [x] Blur background effects for camera control buttons
- [x] EXIF metadata preservation and orientation correction
- [x] BlurButton reusable component for consistent UI effects
- [x] **Template System Foundation** - Core template architecture with Rule of Thirds
- [x] **Camera Viewfinder Hook** - Precise viewfinder area calculations (82% screen height)
- [x] **Template Drawer UI** - Slide-in template selection with live previews
- [x] **Compressed Sizing Pattern** - Uniform scaling for UI elements within viewfinder
- [x] **Template State Management** - TemplateManager service with storage integration
- [x] **Live Template Overlays** - Real-time template rendering over camera view
- [x] **Visual Calibration System** - Red square debugging methodology for perfect overlay alignment

### 🚧 In Progress
- [ ] Photo editing features in RetouchScreen
- [ ] Settings screen features
- [ ] Advanced photo processing options

### 📋 Planned
- [ ] Additional camera controls (flash, timer, etc.)
- [ ] User preferences and settings
- [ ] Photo export options
- [ ] Advanced gesture controls
- [ ] Photo filters and effects

### 🔮 Future Enhancements (Low Priority)
- [ ] **EXIF Lens Information Preservation** - Currently, photos save with complete EXIF metadata including camera settings, GPS, and timestamps, but lens information (e.g., "Wide Camera - 26mm f/1.6") may not display correctly in the iOS Photos app due to limitations in Expo's MediaLibrary. This is a known limitation and doesn't affect the actual photo quality or metadata preservation.

## Development Notes

### Key Integrations
- **Gluestack UI**: Provides modern, accessible components with consistent theming and Slider components
- **Vision Camera**: Enables advanced camera functionality with proper permission handling and exposure controls
- **React Native Reanimated**: Powers smooth spring animations for all UI interactions
- **React Native Gesture Handler**: Handles complex touch interactions and camera gestures
- **Ignite CLI**: Provides robust boilerplate with best practices

### Recent Improvements
- **iPhone-style Camera Layout**: Gallery button on left, shutter in center, camera mode on right
- **Expandable Camera Controls**: Smooth spring animations with bounce effects
- **Vertical Exposure Scrubber**: Gluestack UI Slider with smooth scrubbing and proper validation
- **Unified Click-Away System**: Single overlay handles all popup menu dismissals
- **Consistent Animation Timing**: All animations use the same spring physics (damping: 20, stiffness: 300)
- **Templates Screen**: Clean white background with proper navigation integration
- **EXIF-based Image Rotation**: Professional image processing with smart caching system
- **Three-Button Photo Workflow**: Discard, Save, and Retouch functionality
- **Smart File Management**: Automatic cleanup and memory optimization
- **Exposure Controls State Management**: Proper dependency on mode menu state
- **Blur Background Effects**: Modern blur effects for camera control buttons using @react-native-community/blur
- **EXIF Metadata Handling**: Complete metadata preservation with orientation correction using @lodev09/react-native-exify
- **Reusable BlurButton Component**: Consistent blur effects across camera interface

## Styling Architecture

### Theme System
PixAssist uses a sophisticated theming system built on Ignite CLI's foundation:

```
ThemeProvider (Custom)
├── GluestackUIProvider (External)
├── SafeAreaProvider (React Navigation)
└── AppNavigator
```

### Component Hierarchy
- **Gluestack UI**: Provides modern, accessible components with consistent theming
- **Custom Theme Provider**: Light/dark mode support with MMKV persistence
- **Ignite CLI Components**: Reusable UI components with theming support

### Styling Approach
- **Themed Components**: Use `useAppTheme()` hook for theme-aware styling
- **Style Objects**: Consistent `$` prefix for style objects (e.g., `$container`)
- **TypeScript Integration**: Fully typed styling with `ViewStyle`, `TextStyle`, etc.
- **Platform Consistency**: Unified styling across iOS and Android
- **Style Organization**: Extract styles to separate `.styles.ts` files for components with 5+ style definitions
- **Import Pattern**: Use `import * as styles from "./ComponentName.styles"` for clean style references

### Error Handling Approach
- **Centralized System**: Use `useErrorHandler` hook for all async operations
- **Error Categories**: Use `ErrorCategory` enum (CAMERA, TEMPLATE, PERMISSION, etc.)
- **Error Severity**: Use `ErrorSeverity` enum (LOW, MEDIUM, HIGH, CRITICAL)
- **Error Types**: Use specific error types (e.g., `'device_unavailable'` for camera errors)
- **Recovery Actions**: Leverage `ErrorRecoveryAction` for automatic error recovery
- **Context Information**: Always provide meaningful context in error objects
- **User Messages**: Include user-friendly error messages for all error scenarios

### Component Architecture Approach
- **Single Responsibility**: Each component should have one clear purpose
- **Custom Hooks**: Extract complex logic into reusable custom hooks
- **Unified Views**: Avoid duplicate code blocks - use conditional rendering instead
- **Error Boundaries**: Wrap components in error boundaries for graceful failure handling
- **TypeScript Interfaces**: Define clear interfaces for all component props
- **Performance**: Use `React.memo` and `useMemo` for expensive operations

## Performance Optimization Approach
- **Component Memoization**: Use `React.memo` with custom comparison functions for all extracted components
- **Callback Optimization**: Memoize all event handlers and render functions with `useCallback`
- **Calculation Memoization**: Use `useMemo` for expensive calculations and return objects
- **Hook Optimization**: Memoize custom hook return objects to prevent unnecessary re-renders
- **FlatList Performance**: Use performance props (`getItemLayout`, `removeClippedSubviews`, `maxToRenderPerBatch`)
- **Image Optimization**: Enable caching, progressive rendering, and optimize fade durations
- **Template Rendering**: Memoize template components to prevent unnecessary re-renders
- **Performance Monitoring**: Use performance measurement utilities to validate optimizations

### Key Styling Files
- `app/theme/context.tsx` - Theme provider and context
- `app/theme/theme.ts` - Light/dark theme definitions
- `app/theme/colors.ts` & `app/theme/colorsDark.ts` - Color palettes
- `app/theme/spacing.ts` & `app/theme/spacingDark.ts` - Spacing system
- `app/theme/typography.ts` - Typography definitions

## Template System Architecture

### Core Components
- **TemplateDrawer** - Main slide-in drawer for template selection
- **TemplateCarousel** - Horizontal scrollable template previews
- **TemplatePreviewCard** - Individual template preview with live rendering
- **TemplateOverlay** - Live template overlay on camera view

### Custom Hooks

#### `useCameraViewfinder()`
**Location**: `app/hooks/useCameraViewfinder.ts`  
**Purpose**: Calculates precise camera viewfinder dimensions for perfect template alignment

```typescript
const viewfinder = useCameraViewfinder()
// Returns: { width, height, x, y, aspectRatio, blackBars }
```

**Key Features**:
- **Empirically determined**: 82% of screen height for viewfinder area
- **Perfect alignment**: Accounts for camera's `resizeMode="contain"` behavior
- **Comprehensive data**: Includes black bar calculations and aspect ratios
- **Performance optimized**: Memoized calculations

**Documentation**: See `app/hooks/useCameraViewfinder.md` for detailed usage patterns

**Visual Calibration**: The hook includes a red square calibration methodology for perfect overlay alignment. When developing new overlays, use the calibration pattern to ensure pixel-perfect positioning.

#### `useTemplates()`
**Location**: `app/templates/hooks/useTemplates.ts`  
**Purpose**: Manages template state and provides template selection functionality

```typescript
const { templates, selectedTemplateId, setCurrentTemplate } = useTemplates()
```

**Key Features**:
- **Template management**: Add, remove, activate templates
- **Category switching**: Core vs Pro template categories
- **State persistence**: Integrates with TemplateStorage service
- **Real-time updates**: Reactive template state management

### Sizing Patterns

#### Compressed Sizing Pattern
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

### Template Development

#### Creating New Templates
1. **Add to core types**: Define in `app/templates/core/types.ts`
2. **Create component**: Implement in `app/templates/core/components/`
3. **Register in manager**: Add to `TemplateManager.ts`
4. **Use viewfinder hook**: For accurate sizing and positioning

#### Template Structure
```typescript
// Template component example
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
    <View style={{ position: 'absolute', width, height }}>
      {/* Template content */}
    </View>
  )
})
```

### Component Overrides
**Important**: Gluestack UI overrides some React Native components:
- `ActivityIndicator` → `@gluestack-ui/spinner` (burst-style spinner)
- `Button` → Gluestack UI Button components
- `Slider` → Gluestack UI Slider components

This means standard React Native components may appear differently than expected when using Gluestack UI.

### Compatibility
- React Native 0.79.5
- Expo SDK 53
- iOS 13+ and Android API 21+

### `./assets` directory

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```tree
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

Ignite comes with a built-in `Icon` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/app/components/Icon.md).

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

Another valuable built-in component within Ignite is the `AutoImage` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md).

How to use your `icon` or `image` assets:

```typescript
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('assets/images/my_image.png')} />
  );
};
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

### External Documentation
- [Ignite CLI Documentation](https://github.com/infinitered/ignite/blob/master/docs/README.md)
- [Gluestack UI Documentation](https://ui.gluestack.io/)
- [Vision Camera Documentation](https://react-native-vision-camera.com/)
- [React Navigation Documentation](https://reactnavigation.org/)

### Internal Documentation
- [Camera Viewfinder Hook Guide](./app/hooks/useCameraViewfinder.md) - Detailed usage patterns and best practices
- [Template System Implementation](./TEMPLATE_SYSTEM_IMPLEMENTATION.md) - Complete template system architecture
- [Architecture Overview](./ARCHITECTURE.md) - Project architecture and dependency management
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Recent refactoring changes and improvements

## License

This project is licensed under the MIT License - see the LICENSE file for details.
