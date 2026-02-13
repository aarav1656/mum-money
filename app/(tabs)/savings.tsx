import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useSavingsStore } from "@/store/savingsStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import * as Haptics from "expo-haptics";

type SwapCategory = Database["public"]["Tables"]["swap_categories"]["Row"];
type SmartSwap = Database["public"]["Tables"]["smart_swaps"]["Row"];

export default function SavingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { logSwap } = useSavingsStore();
  const [categories, setCategories] = useState<SwapCategory[]>([]);
  const [swaps, setSwaps] = useState<SmartSwap[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loggingSwapId, setLoggingSwapId] = useState<string | null>(null);
  const [loggedSwapIds, setLoggedSwapIds] = useState<Set<string>>(new Set());

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  useEffect(() => {
    fetchSwaps();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("swap_categories")
      .select("*")
      .order("sort_order");

    if (data) setCategories(data);
  };

  const fetchSwaps = async () => {
    // Only show full loading on first load — keep existing data visible on filter change
    if (swaps.length === 0) setInitialLoading(true);

    let query = supabase
      .from("smart_swaps")
      .select("*")
      .eq("region", profile?.location ?? "UK")
      .order("savings_amount", { ascending: false });

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }

    const { data } = await query.limit(50);
    if (data) setSwaps(data);
    setInitialLoading(false);
  };

  const handleLogSwap = async (swap: SmartSwap) => {
    if (!profile?.id) return;
    setLoggingSwapId(swap.id);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logSwap(profile.id, swap.id, swap.savings_amount);
    setLoggedSwapIds((prev) => new Set(prev).add(swap.id));
    setLoggingSwapId(null);
  };

  const renderSwapCard = ({ item }: { item: SmartSwap }) => {
    const isLogging = loggingSwapId === item.id;
    const isLogged = loggedSwapIds.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-white rounded-2xl p-4 mx-6 mb-3 border border-gray-100"
        onPress={() =>
          router.push({
            pathname: "/(modals)/swap-detail",
            params: { id: item.id },
          })
        }
      >
        {/* Brand swap header */}
        <View className="flex-row items-center mb-2">
          <Text className="text-xs text-gray-400">{item.original_brand}</Text>
          <Ionicons name="arrow-forward" size={12} color="#9CA3AF" style={{ marginHorizontal: 6 }} />
          <Text className="text-xs text-primary-500 font-semibold">{item.swap_brand}</Text>
        </View>

        {/* Product name and prices */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-gray-900">
              {item.original_item}
            </Text>
            <View className="flex-row items-center mt-1.5 gap-3">
              <Text className="text-sm text-gray-400 line-through">
                {currencySymbol}{item.original_price.toFixed(2)}
              </Text>
              <Text className="text-sm text-primary-500 font-bold">
                {currencySymbol}{item.swap_price.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="items-end gap-2">
            <View className="bg-success/10 rounded-lg px-2.5 py-1">
              <Text className="text-success text-sm font-bold">
                -{currencySymbol}{item.savings_amount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className={`rounded-xl px-4 py-2 ${
                isLogged ? "bg-success" : isLogging ? "bg-gray-200" : "bg-primary-500"
              }`}
              onPress={(e) => {
                e.stopPropagation();
                if (!isLogged) handleLogSwap(item);
              }}
              disabled={isLogging || isLogged}
            >
              {isLogging ? (
                <ActivityIndicator size="small" color="#2D6A4F" />
              ) : isLogged ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text className="text-white text-xs font-semibold">Logged</Text>
                </View>
              ) : (
                <Text className="text-white text-xs font-semibold">
                  I did this!
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Smart Swaps</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          Save money with smarter alternatives
        </Text>
      </View>

      {/* Categories - horizontal chips */}
      <View className="mb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: "All", icon: "" } as any, ...categories]}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          keyExtractor={(item) => item.id ?? "all"}
          renderItem={({ item: cat }) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                className={`px-4 py-2.5 rounded-full flex-row items-center ${
                  isSelected
                    ? "bg-primary-500"
                    : "bg-white border border-gray-200"
                }`}
                onPress={() => setSelectedCategory(cat.id)}
              >
                {cat.icon ? <Text className="mr-1.5">{cat.icon}</Text> : null}
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Swaps List */}
      {initialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : swaps.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="swap-horizontal" size={48} color="#D1D5DB" />
          <Text className="text-gray-400 text-center mt-4">
            No swaps available yet for your region. Check back soon!
          </Text>
        </View>
      ) : (
        <FlatList
          data={swaps}
          renderItem={renderSwapCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
