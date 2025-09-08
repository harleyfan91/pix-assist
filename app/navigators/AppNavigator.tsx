/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps } from "react"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { NavigationContainer } from "@react-navigation/native"

import Config from "@/config"
import { CameraScreen } from "@/screens/CameraScreen"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { GalleryScreen } from "@/screens/GalleryScreen"
import { HomeScreen } from "@/screens/HomeScreen"
import { PreviewScreen } from "@/screens/PreviewScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { TemplatesScreen } from "@/screens/TemplatesScreen"

import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Camera: undefined
  Home: undefined
  Gallery: undefined
  Preview: { photoPath: string }
  Settings: undefined
  Templates: undefined
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/native-stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Camera"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_bottom", // Nice modal-like transitions for non-camera screens
      }}
    >
      {/* Camera is the main/initial screen */}
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          animation: "none", // No animation for camera - it stays as the base
        }}
      />
      
      {/* Other screens presented as modals */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      
      <Stack.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}