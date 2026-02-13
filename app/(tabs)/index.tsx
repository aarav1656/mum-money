import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useSavingsStore } from "@/store/savingsStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type SmartSwap = Database["public"]["Tables"]["smart_swaps"]["Row"];
type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type SavingsTip = Database["public"]["Tables"]["savings_tips"]["Row"];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { totalSavedThisWeek, totalSavedThisMonth, streak, fetchTotals, fetchStreak } =
    useSavingsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [todaySwap, setTodaySwap] = useState<SmartSwap | null>(null);
  const [todayRecipe, setTodayRecipe] = useState<Recipe | null>(null);
  const [todayTip, setTodayTip] = useState<SavingsTip | null>(null);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  const fetchDailyContent = async () => {
    const [swapsRes, recipesRes, tipsRes] = await Promise.all([
      supabase
        .from("smart_swaps")
        .select("*")
        .eq("region", profile?.location ?? "UK")
        .limit(10),
      supabase.from("recipes").select("*").limit(10),
      supabase.from("savings_tips").select("*").limit(10),
    ]);

    const dayIndex = new Date().getDate();

    if (swapsRes.data?.length) {
      setTodaySwap(swapsRes.data[dayIndex % swapsRes.data.length]);
    }
    if (recipesRes.data?.length) {
      setTodayRecipe(recipesRes.data[dayIndex % recipesRes.data.length]);
    }
    if (tipsRes.data?.length) {
      setTodayTip(tipsRes.data[dayIndex % tipsRes.data.length]);
    }
  };

  const loadData = async () => {
    if (!profile?.id) return;
    await Promise.all([
      fetchTotals(profile.id),
      fetchStreak(profile.id),
      fetchDailyContent(),
    ]);
  };

  // Refresh totals when coming back to home tab
  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        fetchTotals(profile.id);
        fetchStreak(profile.id);
      }
    }, [profile?.id])
  );

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {greeting}, {firstName}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Let's save some money today
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className="w-11 h-11 rounded-full bg-primary-50 items-center justify-center border border-primary-100"
              onPress={() => router.push("/(modals)/ai-coach")}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Savings Summary */}
        <View className="px-6 mt-4">
          <View className="bg-primary-500 rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-primary-200 text-xs font-medium uppercase tracking-wide">
                  Saved this week
                </Text>
                <Text className="text-white text-3xl font-bold mt-1">
                  {currencySymbol}
                  {totalSavedThisWeek.toFixed(2)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-primary-200 text-xs font-medium uppercase tracking-wide">
                  This month
                </Text>
                <Text className="text-white text-xl font-semibold mt-1">
                  {currencySymbol}
                  {totalSavedThisMonth.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Streak */}
            <View className="flex-row items-center mt-4 pt-4 border-t border-primary-400/40">
              <View className="flex-row items-center bg-primary-400/30 rounded-full px-3 py-1.5">
                <Ionicons name="flame" size={16} color="#FCD34D" />
                <Text className="text-white text-sm font-semibold ml-1.5">
                  {streak?.current_count ?? 0} day streak
                </Text>
              </View>
              <Text className="text-primary-200 text-xs ml-auto">
                Best: {streak?.longest_count ?? 0} days
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            {[
              { label: "Log Swap", icon: "swap-horizontal" as const, color: "#10B981", bg: "bg-emerald-50", route: "/(tabs)/savings" },
              { label: "Meal Plan", icon: "restaurant" as const, color: "#F59E0B", bg: "bg-amber-50", route: "/(tabs)/cook" },
              { label: "Learn", icon: "school" as const, color: "#6366F1", bg: "bg-violet-50", route: "/(tabs)/learn" },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100"
                onPress={() => router.push(action.route as any)}
              >
                <View className={`w-12 h-12 rounded-full ${action.bg} items-center justify-center`}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text className="text-sm font-semibold text-gray-800 mt-2">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Smart Swap */}
        {todaySwap && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Today's Smart Swap
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 border border-gray-100"
              onPress={() =>
                router.push({
                  pathname: "/(modals)/swap-detail",
                  params: { id: todaySwap.id },
                })
              }
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Instead of
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5">
                    {todaySwap.original_brand} {todaySwap.original_item}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-0.5">
                    {currencySymbol}{todaySwap.original_price.toFixed(2)}
                  </Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mx-3">
                  <Ionicons name="arrow-forward" size={18} color="#2D6A4F" />
                </View>
                <View className="flex-1 items-end">
                  <Text className="text-xs text-primary-500 font-medium uppercase tracking-wide">
                    Try this
                  </Text>
                  <Text className="text-base font-semibold text-gray-900 mt-0.5 text-right">
                    {todaySwap.swap_brand} {todaySwap.swap_item}
                  </Text>
                  <Text className="text-sm text-primary-500 font-semibold mt-0.5">
                    {currencySymbol}{todaySwap.swap_price.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View className="bg-success/10 rounded-xl px-3 py-2 mt-3 self-start">
                <Text className="text-success text-sm font-semibold">
                  Save {currencySymbol}{todaySwap.savings_amount.toFixed(2)} each time
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Budget Recipe */}
        {todayRecipe && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Budget Meal Idea
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-5 border border-gray-100"
              onPress={() =>
                router.push({
                  pathname: "/(modals)/recipe-detail",
                  params: { id: todayRecipe.id },
                })
              }
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-semibold text-gray-900">
                    {todayRecipe.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                    {todayRecipe.description}
                  </Text>
                </View>
                <View className="bg-primary-50 rounded-xl px-3 py-2 items-center">
                  <Text className="text-primary-500 text-lg font-bold">
                    {currencySymbol}{todayRecipe.cost_per_serving.toFixed(2)}
                  </Text>
                  <Text className="text-primary-400 text-xs">/serving</Text>
                </View>
              </View>
              <View className="flex-row mt-3 gap-3">
                <View className="flex-row items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {todayRecipe.prep_time + todayRecipe.cook_time} min
                  </Text>
                </View>
                <View className="flex-row items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <Ionicons name="people-outline" size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {todayRecipe.servings} servings
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Tip */}
        {todayTip && (
          <View className="px-6 mt-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Savings Tip
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-secondary-50 rounded-2xl p-5 border border-secondary-200"
              onPress={() =>
                router.push({
                  pathname: "/(modals)/tip-detail",
                  params: { id: todayTip.id },
                })
              }
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-secondary-100 items-center justify-center">
                  <Ionicons name="bulb" size={22} color="#E9C46A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {todayTip.title}
                  </Text>
                  <Text
                    className="text-sm text-gray-600 mt-1"
                    numberOfLines={3}
                  >
                    {todayTip.content}
                  </Text>
                  <View className="bg-primary-50 rounded-lg px-3 py-1.5 mt-2 self-start">
                    <Text className="text-sm text-primary-500 font-semibold">
                      Potential saving: {currencySymbol}
                      {todayTip.estimated_savings.toFixed(0)}/year
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}
