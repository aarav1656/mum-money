import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useSavingsStore } from "@/store/savingsStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { router } from "expo-router";
import { useEffect, useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import Paywall from "@/components/Paywall";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuthStore();
  const { totalSavedAllTime, goals, fetchGoals, fetchTotals } = useSavingsStore();
  const { isPlus, isPro } = useSubscriptionStore();
  const [showPaywall, setShowPaywall] = useState(false);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        fetchGoals(profile.id);
        fetchTotals(profile.id);
      }
    }, [profile?.id])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  if (showPaywall) {
    return (
      <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
        <Paywall onClose={() => setShowPaywall(false)} />
      </View>
    );
  }

  const menuItems = [
    {
      title: "Savings Goals",
      icon: "flag" as const,
      color: "#2D6A4F",
      onPress: () => router.push("/(modals)/add-savings"),
      badge: `${goals.length} active`,
    },
    {
      title: "AI Coach",
      subtitle: "Chat with Penny",
      icon: "chatbubble-ellipses" as const,
      color: "#6366F1",
      onPress: () => router.push("/(modals)/ai-coach"),
    },
    {
      title: "Currency & Region",
      icon: "globe" as const,
      color: "#3B82F6",
      onPress: () => {},
      badge: profile?.currency ?? "GBP",
    },
  ];

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {profile?.name?.charAt(0)?.toUpperCase() ?? "M"}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {profile?.name ?? "MumMoney User"}
              </Text>
              <Text className="text-sm text-gray-500">{profile?.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-primary-500 rounded-2xl p-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="wallet" size={14} color="#A7D7C5" />
                <Text className="text-primary-200 text-xs ml-1">Total Saved</Text>
              </View>
              <Text className="text-white text-xl font-bold">
                {currencySymbol}{totalSavedAllTime.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-secondary-500 rounded-2xl p-4">
              <View className="flex-row items-center mb-1">
                <Ionicons name="flag" size={14} color="#F5E6B8" />
                <Text className="text-secondary-100 text-xs ml-1">Active Goals</Text>
              </View>
              <Text className="text-white text-xl font-bold">
                {goals.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Upsell */}
        {!isPlus && !isPro && (
          <View className="px-6 mb-6">
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-gradient-to-r rounded-2xl p-5 border border-primary-200 overflow-hidden"
              style={{ backgroundColor: "#F0FFF4" }}
              onPress={() => setShowPaywall(true)}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center">
                  <Ionicons name="star" size={24} color="#FCD34D" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    Upgrade to Premium
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    Unlock AI coach, meal planner & more
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2D6A4F" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Goals Preview */}
        {goals.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900">
                Your Goals
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(modals)/add-savings")}
              >
                <Text className="text-sm text-primary-500 font-semibold">
                  + Add Goal
                </Text>
              </TouchableOpacity>
            </View>
            {goals.slice(0, 3).map((goal) => {
              const goalProgress = goal.target_amount > 0
                ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                : 0;
              return (
                <View
                  key={goal.id}
                  className="bg-white rounded-2xl p-4 mb-2 border border-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-2">{goal.icon}</Text>
                      <Text className="text-sm font-semibold text-gray-900">
                        {goal.title}
                      </Text>
                    </View>
                    <Text className="text-sm text-primary-500 font-bold">
                      {Math.round(goalProgress)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-100 rounded-full mt-2">
                    <View
                      className="h-2 bg-primary-500 rounded-full"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-400 mt-1.5">
                    {currencySymbol}{goal.current_amount.toFixed(0)} of {currencySymbol}
                    {goal.target_amount.toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Settings
          </Text>
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 ${
                  index < menuItems.length - 1 ? "border-b border-gray-50" : ""
                }`}
                onPress={item.onPress}
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: item.color + "15" }}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.color}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text className="text-xs text-gray-400">{item.subtitle}</Text>
                  )}
                </View>
                {item.badge && (
                  <Text className="text-xs text-gray-400 mr-2">
                    {item.badge}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white rounded-2xl p-4 items-center border border-red-100"
            onPress={handleSignOut}
          >
            <Text className="text-error font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-8">
          <Text className="text-xs text-gray-300">MumMoney v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
