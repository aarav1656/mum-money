import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"];
type UserProgress = Database["public"]["Tables"]["user_learning_progress"]["Row"];

const LEVEL_CONFIG = [
  { level: 1, title: "Foundations", color: "#10B981", icon: "leaf" as const, description: "Understanding money basics" },
  { level: 2, title: "Getting Started", color: "#6366F1", icon: "rocket" as const, description: "Your first steps into investing" },
  { level: 3, title: "Taking Action", color: "#F59E0B", icon: "trending-up" as const, description: "Opening accounts and building portfolios" },
  { level: 4, title: "Growing Confidence", color: "#EC4899", icon: "diamond" as const, description: "Advanced strategies and planning" },
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch progress every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        if (!isActive) return;

        // Only show full loading on first load
        if (modules.length === 0) setLoading(true);

        const [modulesRes, progressRes] = await Promise.all([
          modules.length === 0
            ? supabase.from("learning_modules").select("*").order("level").order("order_index")
            : { data: modules },
          profile?.id
            ? supabase
                .from("user_learning_progress")
                .select("*")
                .eq("user_id", profile.id)
            : { data: [] as UserProgress[] },
        ]);

        if (!isActive) return;

        if (modulesRes.data && modulesRes.data.length > 0) setModules(modulesRes.data);
        if (progressRes.data) setProgress(progressRes.data);
        setLoading(false);
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [profile?.id])
  );

  const isModuleCompleted = (moduleId: string) =>
    progress.some((p) => p.module_id === moduleId && p.completed);

  const getLevelProgress = (level: number) => {
    const levelModules = modules.filter((m) => m.level === level);
    if (levelModules.length === 0) return 0;
    const completed = levelModules.filter((m) => isModuleCompleted(m.id)).length;
    return Math.round((completed / levelModules.length) * 100);
  };

  const getTotalProgress = () => {
    if (modules.length === 0) return 0;
    const completed = modules.filter((m) => isModuleCompleted(m.id)).length;
    return Math.round((completed / modules.length) * 100);
  };

  const completedCount = progress.filter((p) => p.completed).length;

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-900">
            Learn to Invest
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            Bite-sized lessons, no jargon
          </Text>
        </View>

        {/* Overall Progress */}
        <View className="mx-6 bg-primary-500 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-primary-100 text-sm">Your progress</Text>
              <Text className="text-white text-2xl font-bold mt-1">
                {getTotalProgress()}% complete
              </Text>
            </View>
            <View className="w-16 h-16 rounded-full border-4 border-primary-300 items-center justify-center">
              <Text className="text-white text-lg font-bold">
                {completedCount}
              </Text>
              <Text className="text-primary-200 text-xs -mt-1">
                /{modules.length}
              </Text>
            </View>
          </View>
          {/* Progress bar */}
          <View className="h-2 bg-primary-400/50 rounded-full mt-4">
            <View
              className="h-2 bg-white rounded-full"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </View>
        </View>

        {/* Disclaimer */}
        <View className="mx-6 bg-amber-50 rounded-xl p-3 mb-6 flex-row items-start">
          <Ionicons name="information-circle" size={18} color="#F59E0B" />
          <Text className="text-xs text-amber-700 ml-2 flex-1 leading-4">
            This is educational content only, not financial advice. Your capital
            is at risk when investing. Please consult a qualified financial
            adviser before making investment decisions.
          </Text>
        </View>

        {/* Levels */}
        {LEVEL_CONFIG.map((levelConfig) => {
          const levelModules = modules.filter(
            (m) => m.level === levelConfig.level
          );
          const levelProgress = getLevelProgress(levelConfig.level);

          return (
            <View key={levelConfig.level} className="mb-6">
              {/* Level Header */}
              <View className="px-6 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: levelConfig.color + "20" }}
                    >
                      <Ionicons
                        name={levelConfig.icon}
                        size={20}
                        color={levelConfig.color}
                      />
                    </View>
                    <View className="ml-3">
                      <Text className="text-base font-bold text-gray-900">
                        {levelConfig.title}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {levelConfig.description}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: levelConfig.color }}
                  >
                    {levelProgress}%
                  </Text>
                </View>
                {/* Progress bar */}
                <View className="h-1.5 bg-gray-200 rounded-full mt-2">
                  <View
                    className="h-1.5 rounded-full"
                    style={{
                      backgroundColor: levelConfig.color,
                      width: `${levelProgress}%`,
                    }}
                  />
                </View>
              </View>

              {/* Modules */}
              <View className="px-6 gap-2">
                {levelModules.map((module, index) => {
                  const completed = isModuleCompleted(module.id);
                  return (
                    <TouchableOpacity
                      key={module.id}
                      activeOpacity={0.7}
                      className={`flex-row items-center p-4 rounded-2xl border ${
                        completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-100"
                      }`}
                      onPress={() =>
                        router.push({
                          pathname: "/(modals)/learning-module",
                          params: { id: module.id },
                        })
                      }
                    >
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          completed ? "bg-success" : "bg-gray-100"
                        }`}
                      >
                        {completed ? (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : (
                          <Text className="text-xs font-bold text-gray-400">
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className={`text-sm font-semibold ${
                            completed ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {module.title}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                          {module.duration_minutes} min {module.content_type}
                        </Text>
                      </View>
                      <Ionicons
                        name={completed ? "checkmark-circle" : "chevron-forward"}
                        size={20}
                        color={completed ? "#10B981" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
