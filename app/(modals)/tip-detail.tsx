import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import * as Haptics from "expo-haptics";

type SavingsTip = Database["public"]["Tables"]["savings_tips"]["Row"];

export default function TipDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [tip, setTip] = useState<SavingsTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useEffect(() => {
    if (id) fetchTip();
  }, [id]);

  const fetchTip = async () => {
    const { data } = await supabase
      .from("savings_tips")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setTip(data);
    setLoading(false);
  };

  const handleLog = async () => {
    if (!profile?.id || !tip) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await supabase.from("user_tips_logged").insert({
      user_id: profile.id,
      tip_id: tip.id,
      actual_savings: tip.estimated_savings / 12, // Monthly equivalent
    });
    setLogged(true);
  };

  const handleClose = () => {
    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  if (loading || !tip) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  const getDifficultyColor = (d: string) =>
    d === "Easy" ? "#10B981" : d === "Medium" ? "#F59E0B" : "#EF4444";

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200"
        >
          <Ionicons name="close" size={20} color="#1B1B1B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2 mt-2">
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: getDifficultyColor(tip.difficulty) + "20" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: getDifficultyColor(tip.difficulty) }}
            >
              {tip.difficulty}
            </Text>
          </View>
          <View className="bg-gray-100 rounded-full px-3 py-1">
            <Text className="text-xs text-gray-600">{tip.time_to_implement}</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mt-4">
          {tip.title}
        </Text>

        <Text className="text-base text-gray-700 mt-4 leading-7">
          {tip.content}
        </Text>

        <View className="bg-success/10 rounded-2xl p-5 mt-6 items-center">
          <Text className="text-success text-sm font-medium">
            Estimated annual saving
          </Text>
          <Text className="text-success text-3xl font-bold mt-1">
            {currencySymbol}{tip.estimated_savings.toFixed(0)}
          </Text>
          <Text className="text-success/60 text-sm mt-1">
            That's {currencySymbol}{(tip.estimated_savings / 12).toFixed(0)} per month
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>

      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {logged ? (
          <View className="bg-success rounded-2xl py-4 items-center flex-row justify-center">
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">
              Tip logged! Great move!
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center"
            onPress={handleLog}
          >
            <Text className="text-white text-base font-semibold">
              I did this!
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
