import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useSavingsStore } from "@/store/savingsStore";
import * as Haptics from "expo-haptics";

const GOAL_TYPES = [
  { type: "emergency", label: "Emergency Fund", icon: "🛡️" },
  { type: "holiday", label: "Holiday Fund", icon: "✈️" },
  { type: "renovation", label: "Home Renovation", icon: "🏠" },
  { type: "education", label: "Kids' Education", icon: "🎓" },
  { type: "investing", label: "Investment Starter", icon: "📈" },
  { type: "custom", label: "Custom Goal", icon: "🎯" },
];

export default function AddSavings() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { createGoal } = useSavingsStore();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  const selectedGoalType = GOAL_TYPES.find((g) => g.type === selectedType);

  const handleCreate = async () => {
    if (!profile?.id || !selectedType || !targetAmount) {
      Alert.alert("Missing info", "Please select a type and enter a target amount.");
      return;
    }

    const goalTitle = title || selectedGoalType?.label || "My Goal";
    const target = parseFloat(targetAmount);

    if (isNaN(target) || target <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid target amount.");
      return;
    }

    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    await createGoal({
      user_id: profile.id,
      title: goalTitle,
      target_amount: target,
      goal_type: selectedType,
      icon: selectedGoalType?.icon ?? "🎯",
    });

    setLoading(false);

    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  const handleClose = () => {
    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200"
        >
          <Ionicons name="close" size={20} color="#1B1B1B" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900">New Savings Goal</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-base font-semibold text-gray-800 mb-3">
          What are you saving for?
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {GOAL_TYPES.map((goal) => (
            <TouchableOpacity
              key={goal.type}
              className={`px-4 py-3 rounded-xl border flex-row items-center ${
                selectedType === goal.type
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => {
                setSelectedType(goal.type);
                if (!title) setTitle(goal.label);
              }}
            >
              <Text className="mr-2">{goal.icon}</Text>
              <Text
                className={`text-sm font-medium ${
                  selectedType === goal.type
                    ? "text-primary-500"
                    : "text-gray-700"
                }`}
              >
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-8">
          <Text className="text-base font-semibold text-gray-800 mb-1.5">
            Goal name
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-base text-gray-900"
            placeholder="e.g. Summer holiday to Spain"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mt-6">
          <Text className="text-base font-semibold text-gray-800 mb-1.5">
            Target amount ({currencySymbol})
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3.5 border border-gray-200 text-2xl font-bold text-gray-900"
            placeholder="0.00"
            placeholderTextColor="#D1D5DB"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {targetAmount && parseFloat(targetAmount) > 0 && (
          <View className="bg-primary-50 rounded-xl p-4 mt-4">
            <Text className="text-sm text-primary-700">
              At {currencySymbol}100/month, you'll reach this in{" "}
              <Text className="font-bold">
                {Math.ceil(parseFloat(targetAmount) / 100)} months
              </Text>
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            selectedType && targetAmount ? "bg-primary-500" : "bg-gray-300"
          }`}
          onPress={handleCreate}
          disabled={!selectedType || !targetAmount || loading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Creating..." : "Create Goal"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
