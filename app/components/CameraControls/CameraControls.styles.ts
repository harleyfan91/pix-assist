import { ViewStyle } from "react-native"

export const $bottomControls: ViewStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 120,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingBottom: 34, // Safe area bottom
}

export const $leftControlsContainer: ViewStyle = {
  flex: 1,
  alignItems: 'flex-start',
}

export const $centerControlsContainer: ViewStyle = {
  flex: 1,
  alignItems: 'center',
}

export const $rightControlsContainer: ViewStyle = {
  flex: 1,
  alignItems: 'flex-end',
}

export const $galleryButton: ViewStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
}

export const $shutterButton: ViewStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 4,
  borderColor: '#fff',
}

export const $shutterButtonInner: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#fff',
}

export const $cameraModeContainer: ViewStyle = {
  position: 'relative',
  width: 50,
  height: 50,
  borderRadius: 25,
  overflow: 'hidden',
}

export const $cameraModeBlurBackground: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export const $controlsContainer: ViewStyle = {
  position: 'absolute',
  top: -60,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  height: 50,
}

export const $controlButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
}

export const $chevronButtonContainer: ViewStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
}
