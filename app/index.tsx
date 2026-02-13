import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const { session, isOnboarded } = useAuthStore();

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!isOnboarded) return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(tabs)" />;
}
