import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }}>
      <Stack.Screen name="swap-detail" />
      <Stack.Screen name="recipe-detail" />
      <Stack.Screen name="ai-coach" />
      <Stack.Screen name="add-savings" />
      <Stack.Screen name="tip-detail" />
      <Stack.Screen name="learning-module" />
    </Stack>
  );
}
