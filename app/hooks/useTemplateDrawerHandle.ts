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

interface UseTemplateDrawerHandleProps {
  isTemplateDrawerVisible: boolean
  onTemplateDrawerOpen: () => void
}

export const useTemplateDrawerHandle = ({ 
  isTemplateDrawerVisible, 
  onTemplateDrawerOpen 
}: UseTemplateDrawerHandleProps) => {
  // Template drawer handle animation
  const [drawerTranslateX, setDrawerTranslateX] = useState<SharedValue<number> | null>(null)
  
  // Template drawer handle drag state
  const isDraggingHandle = useSharedValue(false)
  const handleDragOffset = useSharedValue(0)
  
  // Reference to drawer's translateX for synchronization
  const drawerTranslateXRef = useRef<SharedValue<number> | null>(null)
  
  // Callback to receive translateX from TemplateDrawer
  const handleTranslateXChange = useCallback((translateX: SharedValue<number>) => {
    setDrawerTranslateX(translateX)
    drawerTranslateXRef.current = translateX
  }, [])
  
  // Animated style for template drawer handle that moves with drawer
  const templateDrawerHandleStyle = useAnimatedStyle(() => {
    // If we're dragging the handle, follow the finger directly
    if (isDraggingHandle.value) {
      return {
        transform: [{ translateX: handleDragOffset.value }],
      }
    }
    
    // Otherwise, follow the drawer animation
    if (!drawerTranslateX) {
      return {
        transform: [{ translateX: 0 }], // Default position when drawer is closed
      }
    }
    
    // Map drawer translateX to template drawer handle movement
    // When drawer is closed (translateX = SCREEN_WIDTH), handle translateX = 0 (at starting position)
    // When drawer is open (translateX = 0), handle translateX = -SCREEN_WIDTH (moves left off-screen)
    const baseTransform = drawerTranslateX.value - DRAWER_WIDTH
    // Add extra offset when drawer is open to ensure components are completely hidden
    const extraOffset = drawerTranslateX.value < DRAWER_WIDTH * 0.1 ? -20 : 0
    return {
      transform: [{ translateX: baseTransform + extraOffset }],
    }
  }, [drawerTranslateX, isDraggingHandle, handleDragOffset])

  // PanResponder for template drawer handle
  const templateDrawerHandlePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { pageX, pageY } = evt.nativeEvent
      // Use absolute screen coordinates to detect touches at the screen edge
      const isInRightEdge = pageX >= SCREEN_WIDTH - EDGE_DETECTION_WIDTH
      const isInVerticalRange = pageY >= EDGE_DETECTION_TOP && pageY <= EDGE_DETECTION_TOP + EDGE_DETECTION_HEIGHT
      const isDrawerClosed = !isTemplateDrawerVisible
      
      console.log('Template handle touch detected:', { pageX, pageY, isInRightEdge, isInVerticalRange, isDrawerClosed, screenWidth: SCREEN_WIDTH, edgeDetectionTop: EDGE_DETECTION_TOP })
      
      // Always capture touches in the edge area - we'll handle taps and drags in onPanResponderRelease
      return isInRightEdge && isInVerticalRange && isDrawerClosed
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Always return false - we'll handle movement in onPanResponderMove if we've been granted
      return false
    },
    onPanResponderGrant: () => {
      console.log('PanResponder granted')
      // Reset drag state
      isDraggingHandle.value = false
      handleDragOffset.value = 0
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only handle drag if there's significant movement
      if (Math.abs(gestureState.dx) > 10) {
        console.log('Drag detected:', { dx: gestureState.dx })
        // Template drawer handle drag gesture in progress - synchronize with drawer
        isDraggingHandle.value = true
        handleDragOffset.value = gestureState.dx
        
        // Update drawer's translateX to keep them in sync
        if (drawerTranslateXRef.current) {
          const newTranslateX = DRAWER_WIDTH + gestureState.dx
          drawerTranslateXRef.current.value = Math.max(0, Math.min(DRAWER_WIDTH, newTranslateX))
        }
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      console.log('PanResponder release:', { dx: gestureState.dx, dy: gestureState.dy })
      const isTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10
      const shouldOpen = gestureState.dx < -DRAWER_WIDTH * 0.3 || gestureState.vx < -500
      
      // Stop dragging
      isDraggingHandle.value = false
      handleDragOffset.value = 0
      
      if (isTap) {
        console.log('Tap detected - opening drawer')
        // Handle tap - open drawer
        onTemplateDrawerOpen()
      } else if (shouldOpen) {
        console.log('Drag detected - opening drawer')
        // Handle drag - open drawer if dragged far enough
        onTemplateDrawerOpen()
      } else {
        console.log('Gesture cancelled - snapping back')
        // Snap back to closed position
        if (drawerTranslateXRef.current) {
          drawerTranslateXRef.current.value = DRAWER_WIDTH
        }
      }
    },
  })

  return {
    templateDrawerHandleStyle,
    templateDrawerHandlePanResponder,
    handleTranslateXChange,
  }
}
