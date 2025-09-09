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
- 🌙 **Theme Support** - Light/dark mode theming
- 🌍 **Internationalization** - Multi-language support
- 📱 **Cross-Platform** - iOS and Android support

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
├── navigators/          # Navigation configuration
├── screens/            # App screens
│   ├── HomeScreen.tsx  # Welcome/home screen
│   ├── CameraScreen.tsx # Camera functionality with exposure controls
│   ├── GalleryScreen.tsx # Photo gallery with media library integration
│   ├── PreviewScreen.tsx # Photo preview with EXIF rotation and smart caching
│   ├── RetouchScreen.tsx # Photo editing placeholder
│   └── SettingsScreen.tsx # App settings
├── services/           # Business logic and API services
│   └── photoLibrary.ts # Media library service for photo management
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

### Key Styling Files
- `app/theme/context.tsx` - Theme provider and context
- `app/theme/theme.ts` - Light/dark theme definitions
- `app/theme/colors.ts` & `app/theme/colorsDark.ts` - Color palettes
- `app/theme/spacing.ts` & `app/theme/spacingDark.ts` - Spacing system
- `app/theme/typography.ts` - Typography definitions

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

- [Ignite CLI Documentation](https://github.com/infinitered/ignite/blob/master/docs/README.md)
- [Gluestack UI Documentation](https://ui.gluestack.io/)
- [Vision Camera Documentation](https://react-native-vision-camera.com/)
- [React Navigation Documentation](https://reactnavigation.org/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
