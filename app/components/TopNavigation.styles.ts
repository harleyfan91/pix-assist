import { ViewStyle } from "react-native"

// Overlay styles
export const $overlay: ViewStyle = {
  position: "absolute",
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0,
  backgroundColor: "transparent",
  zIndex: 999,
}

// Drawer styles
export const $drawer: ViewStyle = {
  position: "absolute",
  top: 0, 
  left: 0, 
  right: 0,
  backgroundColor: "transparent",
  paddingHorizontal: 20,
  paddingBottom: 4,
  zIndex: 1000,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

// Icons container styles
export const $iconsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingTop: 12,
  paddingBottom: 12,
}

export const $iconButton: ViewStyle = {
  padding: 12,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 60,
}

// Handle styles
export const $handle: ViewStyle = {
  position: "absolute",
  bottom: 0, 
  left: 0, 
  right: 0,
  paddingVertical: 12,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
}

export const $handleBar: ViewStyle = {
  width: 36,
  height: 4,
  backgroundColor: "#fff",
  borderRadius: 2,
}

// Blur background styles
export const $blurBackground: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}
