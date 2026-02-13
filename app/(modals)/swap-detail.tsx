import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useSavingsStore } from "@/store/savingsStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import * as Haptics from "expo-haptics";

type SmartSwap = Database["public"]["Tables"]["smart_swaps"]["Row"];

export default function SwapDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { logSwap } = useSavingsStore();
  const [swap, setSwap] = useState<SmartSwap | null>(null);
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useEffect(() => {
    if (id) fetchSwap();
  }, [id]);

  const fetchSwap = async () => {
    const { data } = await supabase
      .from("smart_swaps")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setSwap(data);
    setLoading(false);
  };

  const handleLogSwap = async () => {
    if (!profile?.id || !swap) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logSwap(profile.id, swap.id, swap.savings_amount);
    setLogged(true);
  };

  const handleClose = () => {
    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  if (loading || !swap) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  const annualSavings = swap.savings_amount * 52;

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200"
        >
          <Ionicons name="close" size={20} color="#1B1B1B" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 justify-center">
        {/* Visual comparison */}
        <View className="items-center">
          {/* Original */}
          <View className="bg-white rounded-2xl p-6 w-full border border-gray-200 mb-4">
            <Text className="text-sm text-gray-400 text-center">Instead of</Text>
            <Text className="text-xl font-bold text-gray-900 text-center mt-2">
              {swap.original_brand}
            </Text>
            <Text className="text-base text-gray-600 text-center">
              {swap.original_item}
            </Text>
            <Text className="text-2xl font-bold text-gray-400 text-center mt-2 line-through">
              {currencySymbol}{swap.original_price.toFixed(2)}
            </Text>
          </View>

          <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center -my-2 z-10">
            <Ionicons name="arrow-down" size={24} color="#fff" />
          </View>

          {/* Swap */}
          <View className="bg-primary-50 rounded-2xl p-6 w-full border-2 border-primary-500 mt-4">
            <Text className="text-sm text-primary-500 text-center">Try this</Text>
            <Text className="text-xl font-bold text-gray-900 text-center mt-2">
              {swap.swap_brand}
            </Text>
            <Text className="text-base text-gray-600 text-center">
              {swap.swap_item}
            </Text>
            <Text className="text-2xl font-bold text-primary-500 text-center mt-2">
              {currencySymbol}{swap.swap_price.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Savings */}
        <View className="bg-success/10 rounded-2xl p-5 mt-6 items-center">
          <Text className="text-success text-sm font-medium">You save</Text>
          <Text className="text-success text-3xl font-bold mt-1">
            {currencySymbol}{swap.savings_amount.toFixed(2)}
          </Text>
          <Text className="text-success/70 text-sm mt-1">
            That's {currencySymbol}{annualSavings.toFixed(0)} per year if you swap weekly!
          </Text>
        </View>
      </View>

      {/* CTA */}
      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {logged ? (
          <View className="bg-success rounded-2xl py-4 items-center flex-row justify-center">
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">
              Swap logged! Well done!
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center"
            onPress={handleLogSwap}
          >
            <Text className="text-white text-base font-semibold">
              I made this swap!
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
