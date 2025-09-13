import { ViewStyle, TextStyle, ImageStyle } from "react-native"

// Main container styles
export const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#0b0b0b", // Background - slightly lighter than layer 8
}

// Gradient layers - Layer 1 is innermost (darkest), Layer 8 is outermost (lightest)
export const $gradientLayer1: ViewStyle = {
  position: "absolute",
  top: "3.0%",    // 3.0% gap from top edge (happy medium)
  bottom: "3.0%", // 3.0% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "black", // Pure black - darkest (innermost)
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer2: ViewStyle = {
  position: "absolute",
  top: "2.6%",    // 2.6% gap from top edge (happy medium)
  bottom: "2.6%", // 2.6% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#040404", // Almost black
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer3: ViewStyle = {
  position: "absolute",
  top: "2.2%",    // 2.2% gap from top edge (happy medium)
  bottom: "2.2%", // 2.2% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#060606", // Very dark
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer4: ViewStyle = {
  position: "absolute",
  top: "1.8%",    // 1.8% gap from top edge (happy medium)
  bottom: "1.8%", // 1.8% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#080808", // slightly lighter than layer 3
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer5: ViewStyle = {
  position: "absolute",
  top: "1.4%",    // 1.4% gap from top edge (happy medium)
  bottom: "1.4%", // 1.4% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0a0a0a", // slightly lighter than layer 4
  opacity: 0.6,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer6: ViewStyle = {
  position: "absolute",
  top: "1.0%",    // 1.0% gap from top edge (happy medium)
  bottom: "1.0%", // 1.0% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0c0c0c", // Slightly lighter than layer 5
  opacity: 0.7,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer7: ViewStyle = {
  position: "absolute",
  top: "0.6%",    // 0.6% gap from top edge (happy medium)
  bottom: "0.6%", // 0.6% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0e0e0e", // Very subtle difference
  opacity: 0.8,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

export const $gradientLayer8: ViewStyle = {
  position: "absolute",
  top: "0.2%",    // 0.2% gap from top edge (happy medium)
  bottom: "0.2%", // 0.2% gap from bottom edge
  left: 0,
  right: 0,
  backgroundColor: "#0d0d0d", // Slight darker than background (outermost)
  opacity: 0.8,
  borderRadius: 20, // Even more pronounced curved edges
  zIndex: -1, // Behind everything
}

// Content and camera container styles
export const $content: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

export const $cameraContainer: ViewStyle = {
  flex: 1,
}

// Bottom controls styles
export const $bottomControls: ViewStyle = {
  position: "absolute",
  bottom: 85, // Moved up 5px from 80 to give more breathing room from viewfinder edge
  left: 0,
  right: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 40,
  zIndex: 100, // Ensure controls are above camera gestures
}

// Landscape-specific bottom controls (moved to right side)
export const $bottomControlsLandscape: ViewStyle = {
  position: "absolute",
  right: 40,
  top: "50%",
  transform: [{ translateY: -120 }], // Center vertically
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  height: 240, // Space for all controls
  paddingVertical: 0,
}

export const $leftControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  width: 60, // Fixed width to match gallery button
}

export const $centerControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  flex: 1, // Take up remaining space to center the shutter button
}

export const $rightControlsContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "flex-end", // Align button to bottom of container
  height: 80, // Fixed height to match button height
  width: 60, // Fixed width to match camera mode button
  paddingBottom: 10, // Push button up to align with gallery button
}

// Button styles
export const $shutterButton: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderWidth: 1,
  borderColor: "#fff",
  justifyContent: "center",
  alignItems: "center",
}

export const $shutterButtonInner: ViewStyle = {
  width: 70,
  height: 70,
  borderRadius: 45,
  backgroundColor: "#fff",
}

export const $galleryButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
}

export const $cameraModeButton: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 0,
  borderColor: "rgba(255, 255, 255, 0.5)",
  justifyContent: "center", // Center content when collapsed
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

export const $cameraModeContainer: ViewStyle = {
  width: 60,
  borderRadius: 30,
  overflow: "hidden",
  position: "relative",
}

export const $cameraModeBlurBackground: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 30,
}

export const $chevronButtonContainer: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 44, // Fixed height for chevron area
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1, // Above the blur background
}

export const $chevronButton: ViewStyle = {
  width: 60,
  height: 44,
  borderRadius: 22,
}

export const $chevronContainer: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
}

export const $controlsContainer: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 44, // Leave space for chevron at bottom
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: 12,
}

export const $controlButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 4,
}

// Overlay styles
export const $flashOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#ffffff",
  pointerEvents: "none",
}

export const $previewOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
}

export const $previewContainer: ViewStyle = {
  width: "80%",
  height: "80%",
  justifyContent: "center",
  alignItems: "center",
}

export const $previewImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

export const $unifiedOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "transparent",
  zIndex: 1,
}

// Focus and popup styles
export const $focusRing: ViewStyle = {
  position: "absolute",
  width: 100,
  height: 100,
  borderWidth: 2,
  borderColor: "#FFD700", // Gold color like iPhone
  borderRadius: 50,
  backgroundColor: "transparent",
}

// Popup Indicator Styles
export const $popupIndicator: ViewStyle = {
  position: "absolute",
  bottom: 180, // Position above the shutter button area
  alignSelf: "center", // Centers horizontally automatically
  zIndex: 10, // Above other elements
}

export const $popupBlurBackground: ViewStyle = {
  position: "relative",
  width: 44, // Fixed width
  height: 44, // Fixed height - same as width for perfect circle
  borderRadius: 22, // Half of width/height for perfect circle
  justifyContent: "center", // Center content vertically
  alignItems: "center", // Center content horizontally
  overflow: "hidden",
}

export const $popupBlurView: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 30, // Match the outer radius for perfect circle
}

export const $popupTextContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
}

export const $popupTextContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}

export const $popupText: TextStyle = {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
  textAlign: "center",
}

// Exposure controls styles
export const $exposureControlsVertical: ViewStyle = {
  position: "absolute",
  bottom: 300, // Position well above the camera mode button to avoid overlap
  right: 40, // Same right position as camera mode button
  width: 60,
  height: 200, // Same height as expanded camera mode button
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2, // Higher than overlay to remain clickable
}

export const $exposureControlsBlur: ViewStyle = {
  width: 60,
  height: 200,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
}

// Landscape-specific exposure controls (positioned above camera mode button)
export const $exposureControlsVerticalLandscape: ViewStyle = {
  position: "absolute",
  right: 40,
  top: "50%",
  transform: [{ translateY: -200 }], // Position above camera mode button
  width: 60,
  height: 200,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex: 2,
}

export const $exposureSliderContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  height: 160,
}

export const $gluestackSlider: ViewStyle = {
  height: 100,
  width: 4,
}

export const $sliderTrack: ViewStyle = {
  height: 100,
  width: 4,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  borderRadius: 2,
}

export const $sliderFilledTrack: ViewStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.6)",
}

export const $sliderThumb: ViewStyle = {
  backgroundColor: "#fff",
  width: 20,
  height: 20,
  borderRadius: 10,
}

export const $exposureLabel: TextStyle = {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
}

// Slider wrapper for positioning the neutral line
export const $sliderWrapper: ViewStyle = {
  position: "relative",
  height: 100,
  width: 4,
  justifyContent: "center",
  alignItems: "center",
}

// Neutral position indicator line
export const $neutralPositionLine: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: -8, // Extend 8px to the left of the slider
  right: -8, // Extend 8px to the right of the slider
  height: 1,
  backgroundColor: "rgba(255, 255, 255, 0.6)",
  zIndex: 0, // Behind the slider
}

// No Camera Overlay Styles
export const $noCameraOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 5,
}

export const $noCameraTitle: TextStyle = {
  color: "#ff6b6b",
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 16,
  textAlign: "center",
}

export const $noCameraSubtitle: TextStyle = {
  color: "#ff6b6b",
  fontSize: 16,
  marginTop: 8,
  textAlign: "center",
  opacity: 0.8,
}
