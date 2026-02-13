import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import * as Haptics from "expo-haptics";

type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"];

export default function LearningModuleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [module, setModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) fetchModule();
  }, [id]);

  const fetchModule = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("learning_modules")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setModule(data);

    // Check if already completed
    if (profile?.id) {
      const { data: progress } = await supabase
        .from("user_learning_progress")
        .select("completed")
        .eq("user_id", profile.id)
        .eq("module_id", id)
        .single();
      if (progress?.completed) setCompleted(true);
    }

    setLoading(false);
  };

  const handleComplete = async () => {
    if (!profile?.id || !id) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Upsert progress
    await supabase.from("user_learning_progress").upsert(
      {
        user_id: profile.id,
        module_id: id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_id" }
    );

    setCompleted(true);
  };

  const handleClose = () => {
    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  if (loading || !module) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  // Parse content into sections (separated by \n\n)
  const sections = module.content.split("\n\n").filter(Boolean);

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200"
        >
          <Ionicons name="close" size={20} color="#1B1B1B" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-400 ml-1">
            {module.duration_minutes} min read
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Level badge */}
        <View className="flex-row items-center mt-4">
          <View className="bg-primary-50 rounded-full px-3 py-1">
            <Text className="text-xs text-primary-500 font-semibold">
              Level {module.level}
            </Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mt-3">
          {module.title}
        </Text>
        {module.subtitle && (
          <Text className="text-base text-gray-500 mt-1">
            {module.subtitle}
          </Text>
        )}

        {/* Content */}
        <View className="mt-6 gap-4">
          {sections.map((section, index) => (
            <Text key={index} className="text-base text-gray-700 leading-7">
              {section}
            </Text>
          ))}
        </View>

        {/* Disclaimer */}
        <View className="bg-amber-50 rounded-xl p-3 mt-6 flex-row items-start">
          <Ionicons name="information-circle" size={16} color="#F59E0B" />
          <Text className="text-xs text-amber-700 ml-2 flex-1 leading-4">
            This is educational content, not financial advice. Your capital is at
            risk when investing. Seek independent financial advice if needed.
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {completed ? (
          <View className="bg-success rounded-2xl py-4 items-center flex-row justify-center">
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text className="text-white text-base font-semibold ml-2">
              Lesson complete!
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center"
            onPress={handleComplete}
          >
            <Text className="text-white text-base font-semibold">
              Mark as Complete
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
