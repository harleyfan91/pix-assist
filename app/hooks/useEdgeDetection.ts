import { useCallback, useRef, useState } from 'react'
import { View, PanResponder, Dimensions } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const DRAWER_WIDTH = SCREEN_WIDTH
const EDGE_DETECTION_WIDTH = 25
const EDGE_DETECTION_HEIGHT = 50
const EDGE_DETECTION_TOP = (SCREEN_HEIGHT - EDGE_DETECTION_HEIGHT) / 3

interface UseEdgeDetectionProps {
  isTemplateDrawerVisible: boolean
  onTemplateDrawerOpen: () => void
}

export const useEdgeDetection = ({ 
  isTemplateDrawerVisible, 
  onTemplateDrawerOpen 
}: UseEdgeDetectionProps) => {
  // Edge detection area animation
  const [drawerTranslateX, setDrawerTranslateX] = useState<SharedValue<number> | null>(null)
  
  // Edge detection drag state
  const isDraggingEdge = useSharedValue(false)
  const edgeDragOffset = useSharedValue(0)
  
  // Reference to drawer's translateX for synchronization
  const drawerTranslateXRef = useRef<SharedValue<number> | null>(null)
  
  // Callback to receive translateX from TemplateDrawer
  const handleTranslateXChange = useCallback((translateX: SharedValue<number>) => {
    setDrawerTranslateX(translateX)
    drawerTranslateXRef.current = translateX
  }, [])
  
  // Animated style for edge detection area that moves with drawer
  const edgeDetectionStyle = useAnimatedStyle(() => {
    // If we're dragging the edge, follow the finger directly
    if (isDraggingEdge.value) {
      return {
        transform: [{ translateX: edgeDragOffset.value }],
      }
    }
    
    // Otherwise, follow the drawer animation
    if (!drawerTranslateX) {
      return {
        transform: [{ translateX: 0 }], // Default position when drawer is closed
      }
    }
    
    // Map drawer translateX to edge detection movement
    // When drawer is closed (translateX = SCREEN_WIDTH), edge detection translateX = 0 (at starting position)
    // When drawer is open (translateX = 0), edge detection translateX = -SCREEN_WIDTH (moves left off-screen)
    return {
      transform: [{ translateX: drawerTranslateX.value - DRAWER_WIDTH }],
    }
  }, [drawerTranslateX, isDraggingEdge, edgeDragOffset])

  // PanResponder for edge detection area
  const edgeDetectionPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent
      // Since the component is positioned off-screen, detect touches at the screen edge
      const isInRightEdge = locationX >= SCREEN_WIDTH - EDGE_DETECTION_WIDTH
      const isInVerticalRange = locationY >= EDGE_DETECTION_TOP && locationY <= EDGE_DETECTION_TOP + EDGE_DETECTION_HEIGHT
      const isDrawerClosed = !isTemplateDrawerVisible
      
      return isInRightEdge && isInVerticalRange && isDrawerClosed
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isDraggingLeft = gestureState.dx < -10
      return isDraggingLeft
    },
    onPanResponderGrant: () => {
      // Edge drag gesture started
      isDraggingEdge.value = true
      edgeDragOffset.value = 0
    },
    onPanResponderMove: (evt, gestureState) => {
      // Edge drag gesture in progress - synchronize with drawer
      edgeDragOffset.value = gestureState.dx
      
      // Update drawer's translateX to keep them in sync
      if (drawerTranslateXRef.current) {
        const newTranslateX = DRAWER_WIDTH + gestureState.dx
        drawerTranslateXRef.current.value = Math.max(0, Math.min(DRAWER_WIDTH, newTranslateX))
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      const shouldOpen = gestureState.dx < -DRAWER_WIDTH * 0.3 || gestureState.vx < -500
      
      // Stop dragging
      isDraggingEdge.value = false
      edgeDragOffset.value = 0
      
      if (shouldOpen) {
        onTemplateDrawerOpen()
      } else {
        // Snap back to closed position
        if (drawerTranslateXRef.current) {
          drawerTranslateXRef.current.value = DRAWER_WIDTH
        }
      }
    },
  })

  return {
    edgeDetectionStyle,
    edgeDetectionPanResponder,
    handleTranslateXChange,
  }
}
