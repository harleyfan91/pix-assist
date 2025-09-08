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
│   ├── CameraScreen.tsx # Camera functionality
│   ├── GalleryScreen.tsx # Photo gallery (coming soon)
│   └── SettingsScreen.tsx # App settings (coming soon)
├── theme/              # Theme configuration
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

### 🚧 In Progress
- [ ] Photo capture functionality
- [ ] Local photo storage
- [ ] Photo gallery implementation
- [ ] Settings screen features

### 📋 Planned
- [ ] Photo editing features
- [ ] Additional camera controls (flash, timer, etc.)
- [ ] User preferences
- [ ] Photo export options
- [ ] Advanced gesture controls

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
