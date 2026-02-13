import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialize: initAuth, isLoading, session, isOnboarded } = useAuthStore();
  const initSubscriptions = useSubscriptionStore((s) => s.initialize);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, []);

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      initSubscriptions(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!session) {
      // Not signed in → go to auth
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
      }
    } else if (!isOnboarded) {
      // Signed in but not onboarded → go to onboarding
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)");
      }
    } else {
      // Signed in and onboarded → go to tabs
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [session, isOnboarded, isLoading, segments]);

  if (isLoading) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
