import { ViewStyle, TextStyle, ImageStyle } from "react-native"

// Main container styles
export const $container: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}

// Header styles
export const $header: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 10,
}

export const $refreshButton: ViewStyle = {
  padding: 8,
}

// Content styles
export const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
}

// Photo grid styles
export const $photoGrid: ViewStyle = {
  paddingBottom: 20,
}

export const $row: ViewStyle = {
  justifyContent: 'space-between',
  marginBottom: 4,
}

export const $photoContainer: ViewStyle = {
  width: '31.5%',
  aspectRatio: 0.8,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: '#f0f0f0',
  marginBottom: 4,
}

export const $photoImage: ImageStyle = {
  width: '100%',
  height: '100%',
}

// Empty state styles
export const $emptyState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
}

export const $emptyText: TextStyle = {
  marginTop: 16,
  textAlign: 'center',
}

export const $emptySubtext: TextStyle = {
  marginTop: 8,
  textAlign: 'center',
  color: '#666',
  fontSize: 14,
}

// Error state styles
export const $errorState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
}

export const $errorText: TextStyle = {
  marginTop: 16,
  textAlign: 'center',
  color: '#ff6b6b',
}

export const $errorSubtext: TextStyle = {
  marginTop: 8,
  textAlign: 'center',
  color: '#666',
  fontSize: 14,
}

export const $retryButton: ViewStyle = {
  marginTop: 20,
  paddingHorizontal: 20,
  paddingVertical: 10,
  backgroundColor: '#007AFF',
  borderRadius: 8,
}

export const $retryButtonText: TextStyle = {
  color: '#fff',
  fontWeight: '600',
}

// Loading state styles
export const $loadingState: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}

export const $loadingText: TextStyle = {
  marginTop: 16,
  color: '#666',
}
