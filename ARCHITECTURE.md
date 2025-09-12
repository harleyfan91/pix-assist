# PixAssist - Full Stack Architecture

> **IMPORTANT**: Before installing any new dependencies, review this architecture document to ensure the new package is necessary and doesn't conflict with existing packages. All core functionality is covered by the established stack.

## Architecture Overview

PixAssist is built as a React Native mobile application with a comprehensive, purpose-built dependency stack that covers all core functionality. The architecture prioritizes performance, maintainability, and cross-platform compatibility.

## Frontend/Mobile Stack

### Core Framework
- **React Native (0.79.5)** - Cross-platform mobile development framework
- **Expo (53.0.15)** - Development tools, services, and build pipeline
- **TypeScript (5.8.3)** - Type safety and enhanced developer experience

### UI & Styling
- **Gluestack UI** - Modern, accessible UI component library
  - `@gluestack-ui/themed` (1.1.73) - Themed components
  - `@gluestack-ui/config` (1.1.20) - Configuration system
  - `@gluestack-ui/utils` (3.0.3) - Utility functions
  - `@gluestack-style/react` (1.0.57) - Styling system
- **React Native Reanimated (3.17.4)** - High-performance animations and transitions
- **React Native Gesture Handler (2.24.0)** - Advanced touch interactions and gestures

### Camera & Vision
- **React Native Vision Camera (4.7.2)** - Core camera functionality with custom viewfinder overlays
  - Provides advanced camera controls
  - Handles camera permissions
  - Supports custom overlays and real-time processing

### Photo Processing & Editing
- **Expo Image Manipulator (13.1.7)** - Professional image processing and rotation
- **Expo File System (18.1.11)** - File management and cleanup operations
- **Expo Media Library (17.1.7)** - Photo gallery integration and management
- **@lodev09/react-native-exify (0.2.7)** - EXIF metadata reading and writing
- **React Native Image Editor (0.0.1)** - Basic image editing capabilities
- **React Native Color Matrix Image Filters (7.0.2)** - Advanced image filters

### Local Storage & File Management
- **React Native MMKV (3.2.0)** - Fast key-value storage for app settings and preferences
- **React Native FS (2.20.0)** - File system access for photo management and storage

### State Management
- **Zustand (5.0.8)** - Lightweight, unopinionated state management
- **TanStack Query (5.87.1)** - Server state management, caching, and synchronization

### Navigation & Routing
- **React Navigation** - Comprehensive navigation solution
  - `@react-navigation/native` (7.0.14) - Core navigation
  - `@react-navigation/native-stack` (7.2.0) - Stack navigator
  - `@react-navigation/bottom-tabs` (7.4.7) - Tab navigation

### System Integration
- **React Native Permissions (4.1.5)** - Camera and storage permissions management
- **React Native Share (12.2.0)** - Photo sharing capabilities
- **Expo Screen Orientation (8.1.7)** - Screen orientation control
- **Expo Sensors (14.1.4)** - Device orientation detection

### UI Assets & Icons
- **Lucide React Native (0.542.0)** - Comprehensive icon library
- **React Native SVG (15.11.2)** - Custom graphics and overlays
- **Expo Vector Icons (14.0.0)** - Additional icon set for platform-specific icons
- **@react-native-community/blur (4.4.1)** - Blur effects for UI components

### Development & Testing
- **Jest with React Native Testing Library** - Unit testing framework
- **ESLint + Prettier** - Code quality and formatting
- **Reactotron** - Development debugging and state inspection
- **TypeScript** - Static type checking

## Dependency Installation Policy

### Before Installing Any New Package:

1. **Review this architecture document** - Ensure the functionality isn't already covered
2. **Check for conflicts** - Verify compatibility with existing packages
3. **Consider alternatives** - Evaluate if existing packages can be extended instead
4. **Document the decision** - Update this file if a new package is approved

### Approved Package Categories:

- **Bug fixes and security updates** for existing packages
- **Minor version updates** that maintain compatibility
- **Development tools** that don't affect production builds
- **Platform-specific packages** for iOS/Android native functionality (with justification)

### Prohibited Without Review:

- **New UI libraries** (Gluestack UI covers all needs)
- **Alternative state management** (Zustand + TanStack Query are sufficient)
- **Additional navigation libraries** (React Navigation is comprehensive)
- **Redundant camera/photo packages** (Vision Camera + Expo Image Manipulator + Media Library cover all needs)
- **Alternative image processing libraries** (Expo Image Manipulator is comprehensive)
- **Additional file management libraries** (Expo File System + React Native FS are sufficient)

## Package Version Management

All packages are pinned to specific versions to ensure:
- **Reproducible builds** across development environments
- **Stable functionality** without unexpected breaking changes
- **Compatibility** between interdependent packages

### Version Update Policy:
- **Patch updates**: Automatic (security fixes)
- **Minor updates**: Review compatibility, test thoroughly
- **Major updates**: Full architecture review required

## Build & Deployment

### Development
- **Expo Dev Client** - Custom development builds
- **Metro Bundler** - JavaScript bundling
- **Hot Reload** - Fast development iteration

### Production
- **EAS Build** - Cloud-based builds for iOS and Android
- **Local builds** - Available for development and testing
- **Code signing** - Automated for both platforms

## Performance Considerations

The architecture is optimized for:
- **Fast startup times** - Minimal bundle size
- **Smooth animations** - Reanimated for 60fps performance
- **Efficient memory usage** - MMKV for fast storage
- **Native performance** - Vision Camera for camera operations

## Security & Privacy

- **Permission management** - Granular control over device access
- **Local storage** - No cloud dependencies for core functionality
- **Type safety** - TypeScript prevents runtime errors
- **Code quality** - ESLint and Prettier maintain standards

## Recent Architecture Updates

### Photo Processing System (January 2025)
- **Added Expo Image Manipulator**: Professional image rotation and processing
- **Added Expo File System**: Robust file management and cleanup
- **Added Expo Media Library**: Native photo gallery integration
- **Added @lodev09/react-native-exify**: EXIF metadata reading and writing
- **Implemented Smart Caching**: Prevents unnecessary image reprocessing
- **Added File Cleanup System**: Automatic memory management
- **EXIF Metadata Preservation**: Complete metadata handling with orientation correction

### UI/UX Improvements (January 2025)
- **Exposure Controls State Management**: Proper dependency on mode menu
- **Fixed Loading Indicators**: Non-intrusive overlay positioning
- **Enhanced Navigation**: Added RetouchScreen with proper routing
- **Improved File Management**: Comprehensive cleanup and error handling
- **Blur Background Effects**: Added @react-native-community/blur for modern UI effects
- **BlurButton Component**: Reusable component for consistent blur effects across camera interface

### Styling System Notes
- **Gluestack UI Overrides**: Some React Native components are overridden
- **ActivityIndicator**: Uses `@gluestack-ui/spinner` (burst-style) instead of standard circle
- **Theme Integration**: Custom theme provider with Gluestack UI compatibility
- **Component Hierarchy**: Gluestack UI wraps entire app, affecting all components

### Style Organization Best Practices
- **Separate Style Files**: Always extract styles to dedicated `.styles.ts` files for components with 5+ style definitions
- **Import Pattern**: Use `import * as styles from "./ComponentName.styles"` for clean style references
- **Naming Convention**: Use `$styleName` pattern for style constants (e.g., `$container`, `$button`)
- **File Structure**: Place style files alongside component files (e.g., `ComponentName.tsx` + `ComponentName.styles.ts`)
- **Benefits**: Improved maintainability, reusability, and reduced component file size

### Known Limitations
- **EXIF Lens Information Display**: While photos preserve complete EXIF metadata including camera settings, GPS, and timestamps, lens information (e.g., "Wide Camera - 26mm f/1.6") may not display correctly in the iOS Photos app due to limitations in Expo's MediaLibrary. This is a known limitation and doesn't affect actual photo quality or metadata preservation.

---

**Last Updated**: January 2025
**Next Review**: When considering new dependencies or major updates
