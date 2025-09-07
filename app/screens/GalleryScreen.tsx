import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"

export const GalleryScreen: FC = function GalleryScreen() {
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$content}>
        <Text preset="heading" text="🖼️ Gallery" />
        <Text preset="subheading" text="Photo gallery coming soon!" />
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}
