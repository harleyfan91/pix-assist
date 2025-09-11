# Camera Viewfinder Hook Usage Guide

## Overview

The `useCameraViewfinder` hook provides accurate dimensions for the camera's viewable area, accounting for black bars created by `resizeMode="contain"` behavior.

## Basic Usage

```typescript
import { useCameraViewfinder } from '@/hooks/useCameraViewfinder'

function MyComponent() {
  const viewfinder = useCameraViewfinder()
  
  // Access viewfinder dimensions
  console.log(viewfinder.width)    // 390px
  console.log(viewfinder.height)   // 692.08px
  console.log(viewfinder.x)        // 0px
  console.log(viewfinder.y)        // 75.96px
}
```

## Positioning Patterns

### 1. **Centered Positioning (Recommended)**
Use this pattern for overlays, previews, and visualizations that need to align with the camera viewfinder:

```typescript
function CameraOverlay() {
  const viewfinder = useCameraViewfinder()
  
  return (
    <View style={{
      position: 'absolute',
      top: (SCREEN_HEIGHT - viewfinder.height) / 2,    // Center vertically
      left: (SCREEN_WIDTH - viewfinder.width) / 2,     // Center horizontally
      width: viewfinder.width,
      height: viewfinder.height,
      // ... other styles
    }}>
      {/* Your overlay content */}
    </View>
  )
}
```

### 2. **Direct Positioning**
Use this pattern when you want the overlay to match the exact camera viewfinder area:

```typescript
function TemplateOverlay() {
  const viewfinder = useCameraViewfinder()
  
  return (
    <View style={{
      position: 'absolute',
      top: viewfinder.y,        // Exact camera viewfinder position
      left: viewfinder.x,       // Exact camera viewfinder position
      width: viewfinder.width,  // Exact camera viewfinder width
      height: viewfinder.height, // Exact camera viewfinder height
      // ... other styles
    }}>
      {/* Your template content */}
    </View>
  )
}
```

### 3. **Preview Card Sizing**
Use this pattern for template preview cards that should show accurate camera proportions:

```typescript
function TemplatePreviewCard() {
  const viewfinder = useCameraViewfinder()
  
  // Scale down for preview while maintaining aspect ratio
  const previewScale = 0.3
  const previewWidth = viewfinder.width * previewScale
  const previewHeight = viewfinder.height * previewScale
  
  return (
    <View style={{
      width: previewWidth,
      height: previewHeight,
      // Center within card container
      alignSelf: 'center',
      // ... other styles
    }}>
      {/* Your preview content */}
    </View>
  )
}
```

## Key Constants

The hook uses these critical constants:

- **`VIEWFINDER_HEIGHT_PERCENTAGE = 0.82`** - Camera uses 82% of screen height
- **Black bars total**: 18% of screen height (9% top + 9% bottom)
- **Viewable area**: 82% of screen height

## Debugging

Use the built-in debug function to inspect viewfinder dimensions:

```typescript
import { logCameraViewfinder } from '@/hooks/useCameraViewfinder'

// Logs detailed viewfinder information
logCameraViewfinder()
```

## Common Use Cases

### Template Overlays
```typescript
// Position templates exactly over camera viewfinder
const templateStyle = {
  position: 'absolute',
  top: viewfinder.y,
  left: viewfinder.x,
  width: viewfinder.width,
  height: viewfinder.height,
}
```

### Preview Cards
```typescript
// Create previews that match camera proportions
const previewStyle = {
  width: viewfinder.width * 0.4,  // 40% scale
  height: viewfinder.height * 0.4,
  aspectRatio: viewfinder.aspectRatio,
}
```

### Visual Debugging
```typescript
// Create debug overlays to visualize viewfinder area
const debugStyle = {
  position: 'absolute',
  top: (SCREEN_HEIGHT - viewfinder.height) / 2,
  left: (SCREEN_WIDTH - viewfinder.width) / 2,
  width: viewfinder.width,
  height: viewfinder.height,
  backgroundColor: 'red',
  borderWidth: 2,
  borderColor: 'white',
}
```

## Important Notes

1. **Always center** when creating visual overlays or debug elements
2. **Use exact positioning** when creating functional overlays (templates, guides)
3. **Maintain aspect ratio** when scaling for previews
4. **The 82% factor is device-specific** - this was determined for the current device/screen size
5. **Black bars are intentional** - they represent the camera's native aspect ratio vs screen ratio

## Migration from Old System

If migrating from the old `cameraViewfinder.ts` utility:

```typescript
// Old way
import { getCameraViewfinderForTemplates } from '@/utils/cameraViewfinder'
const viewfinder = getCameraViewfinderForTemplates()

// New way
import { useCameraViewfinder } from '@/hooks/useCameraViewfinder'
const viewfinder = useCameraViewfinder()
```

The API is identical, but the new hook provides additional metadata and better performance.

## 🎯 **Compressed Sizing Pattern**

For UI elements that need to fit within the viewfinder area but with some padding/margin, use the **compressed sizing pattern**:

### **Pattern: Transform Scale Compression**

```typescript
// ✅ BEST PRACTICE: Compressed sizing with transform scale
const viewfinder = useCameraViewfinder()

<View style={{
  // Use full viewfinder dimensions as base
  width: viewfinder.width,
  height: viewfinder.height,
  
  // Apply uniform compression with transform
  transform: [{ scale: 0.95 }], // 5% compression
  
  // Other styling...
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: 20,
}}>
  {/* Content scales proportionally */}
</View>
```

### **Why Transform Scale?**

1. **Uniform compression** - maintains aspect ratio perfectly
2. **No compounding effects** - single transformation vs width/height multiplication
3. **Proportional scaling** - all internal elements (padding, borders, text) scale together
4. **Clean calculations** - easy to adjust compression percentage

### **Compression Guidelines**

- **5% compression** (`scale: 0.95`) - Subtle fit with padding
- **10% compression** (`scale: 0.9`) - More noticeable compression
- **15% compression** (`scale: 0.85`) - Significant compression for tight spaces

### **Anti-Pattern: Width/Height Multiplication**

```typescript
// ❌ AVOID: Compounding compression effect
width: viewfinder.width * 0.9,   // 10% width reduction
height: viewfinder.height * 0.9, // 10% height reduction
// Result: 0.9 × 0.9 = 0.81 (19% total area reduction!)

// ✅ PREFER: Transform scale for uniform compression
transform: [{ scale: 0.9 }] // Exactly 10% uniform compression
```

### **Real-World Example: Template Cards**

```typescript
// Template preview cards with compressed sizing
<View style={{
  width: viewfinder.width,        // Full viewfinder width
  height: viewfinder.height,      // Full viewfinder height
  transform: [{ scale: 0.95 }],   // 5% uniform compression
  marginRight: CARD_MARGIN,       // Spacing between cards
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: 20,
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
  {/* Card content scales proportionally */}
</View>
```

This pattern ensures consistent, proportional sizing that fits within the viewfinder area while maintaining perfect aspect ratios.
