# PixAssist

> A React Native photo assistance app built with Ignite CLI, Gluestack UI, and Vision Camera

PixAssist is a modern React Native application that provides camera functionality and photo management features. Built using the latest Ignite CLI boilerplate with custom integrations for enhanced UI components and camera capabilities.

## Features

- 📱 **Bottom Tab Navigation** - Easy access to Home, Camera, Gallery, and Settings
- 🎨 **Gluestack UI Integration** - Modern, accessible UI components
- 📷 **Vision Camera** - Full-screen camera with permission handling
- 🌙 **Theme Support** - Light/dark mode theming
- 🌍 **Internationalization** - Multi-language support
- 📱 **Cross-Platform** - iOS and Android support

## Tech Stack

- **React Native 0.79.5** - Cross-platform mobile development
- **Expo SDK 53** - Development tools and services
- **Ignite CLI** - React Native boilerplate and tooling
- **Gluestack UI** - Modern UI component library
- **Vision Camera** - Advanced camera functionality
- **React Navigation** - Navigation library
- **TypeScript** - Type-safe development

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
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

### Building for Simulator/Device

```bash
# Build for iOS simulator
npm run build:ios:sim

# Build for iOS device (development)
npm run build:ios:dev

# Build for iOS device (production)
npm run build:ios:prod
```

### Running the App

```bash
# Start Metro bundler
npm run start

# Run on iOS simulator
npx expo run:ios

# Run on Android
npx expo run:android
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
- [x] Basic camera interface

### 🚧 In Progress
- [ ] Photo capture functionality
- [ ] Photo gallery implementation
- [ ] Settings screen features

### 📋 Planned
- [ ] Photo editing features
- [ ] Cloud storage integration
- [ ] Advanced camera controls
- [ ] User preferences

## Development Notes

### Key Integrations
- **Gluestack UI**: Provides modern, accessible components with consistent theming
- **Vision Camera**: Enables advanced camera functionality with proper permission handling
- **Ignite CLI**: Provides robust boilerplate with best practices

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
