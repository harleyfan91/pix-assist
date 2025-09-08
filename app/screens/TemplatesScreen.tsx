import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"

export const TemplatesScreen: FC = function TemplatesScreen() {
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$content}>
        <Text preset="heading" text="📋 Templates" />
        <Text preset="subheading" text="Templates coming soon!" />
        <Text 
          preset="default" 
          text="We're working on bringing you amazing photo templates to enhance your creativity. Stay tuned!" 
          style={$description}
        />
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

const $description: ViewStyle = {
  textAlign: "center",
  marginTop: 20,
  opacity: 0.7,
}
