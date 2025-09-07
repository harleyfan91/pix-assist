import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@gluestack-ui/themed"

export const GalleryScreen: FC = function GalleryScreen() {
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$content}>
        <Text size="2xl" color="$primary500" textAlign="center">
          🖼️ Gallery
        </Text>
        <Text size="lg" color="$textLight600" textAlign="center" mt="$4">
          Photo gallery coming soon!
        </Text>
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
