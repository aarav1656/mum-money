import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

const GOALS = [
  { id: "grocery", label: "Cut grocery bills", icon: "cart", color: "#10B981" },
  { id: "batch-cook", label: "Batch cook on a budget", icon: "restaurant", color: "#F59E0B" },
  { id: "invest", label: "Start investing", icon: "trending-up", color: "#6366F1" },
  { id: "reno", label: "Save on home renovations", icon: "hammer", color: "#EC4899" },
  { id: "emergency", label: "Build emergency fund", icon: "shield-checkmark", color: "#2D6A4F" },
  { id: "kids-money", label: "Teach kids about money", icon: "school", color: "#F4A261" },
];

const BUDGET_RANGES = [
  { label: "Under £50/week", value: 50 },
  { label: "£50 - £100/week", value: 75 },
  { label: "£100 - £150/week", value: 125 },
  { label: "£150+/week", value: 175 },
];

const SAVINGS_TARGETS = [
  { label: "£50/month", value: 50 },
  { label: "£100/month", value: 100 },
  { label: "£200/month", value: 200 },
  { label: "£500+/month", value: 500 },
];

export default function YourGoals() {
  const insets = useSafeAreaInsets();
  const { updateProfile, profile } = useAuthStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [groceryBudget, setGroceryBudget] = useState<number | null>(null);
  const [savingsTarget, setSavingsTarget] = useState<number | null>(null);

  const currencySymbol = profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const canContinue = selectedGoals.length > 0 && groceryBudget && savingsTarget;

  const handleContinue = async () => {
    if (!canContinue) return;

    await updateProfile({
      weekly_grocery_budget: groceryBudget,
      monthly_savings_target: savingsTarget,
    });

    router.push("/(onboarding)/notifications");
  };

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Progress bar */}
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1B1B1B" />
          </TouchableOpacity>
          <Text className="text-sm text-gray-400">Step 2 of 3</Text>
        </View>
        <View className="h-1.5 bg-gray-200 rounded-full">
          <View className="h-1.5 bg-primary-500 rounded-full w-2/3" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900">
          What are your goals?
        </Text>
        <Text className="text-base text-gray-500 mt-1">
          Select all that apply — we'll tailor your experience
        </Text>

        {/* Goals */}
        <View className="mt-6 gap-3">
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                className={`flex-row items-center p-4 rounded-2xl border ${
                  isSelected
                    ? "bg-primary-50 border-primary-500"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => toggleGoal(goal.id)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: goal.color + "20" }}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={20}
                    color={goal.color}
                  />
                </View>
                <Text
                  className={`ml-3 text-base font-medium flex-1 ${
                    isSelected ? "text-primary-600" : "text-gray-800"
                  }`}
                >
                  {goal.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#2D6A4F" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Grocery Budget */}
        <Text className="text-base font-semibold text-gray-800 mt-8 mb-3">
          Weekly grocery budget
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {BUDGET_RANGES.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`px-4 py-3 rounded-xl border ${
                groceryBudget === item.value
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setGroceryBudget(item.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  groceryBudget === item.value
                    ? "text-primary-500"
                    : "text-gray-700"
                }`}
              >
                {item.label.replace("£", currencySymbol)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Savings Target */}
        <Text className="text-base font-semibold text-gray-800 mt-8 mb-3">
          Monthly savings goal
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {SAVINGS_TARGETS.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`px-4 py-3 rounded-xl border ${
                savingsTarget === item.value
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setSavingsTarget(item.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  savingsTarget === item.value
                    ? "text-primary-500"
                    : "text-gray-700"
                }`}
              >
                {item.label.replace("£", currencySymbol)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* CTA */}
      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            canContinue ? "bg-primary-500" : "bg-gray-300"
          }`}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
