import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@gluestack-ui/themed"

export const SettingsScreen: FC = function SettingsScreen() {
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$content}>
        <Text size="2xl" color="$primary500" textAlign="center">
          ⚙️ Settings
        </Text>
        <Text size="lg" color="$textLight600" textAlign="center" mt="$4">
          App settings coming soon!
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
