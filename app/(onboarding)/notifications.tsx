import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";

const TIME_SLOTS = [
  { label: "Morning (8am)", value: "08:00", icon: "sunny" },
  { label: "Lunchtime (12pm)", value: "12:00", icon: "partly-sunny" },
  { label: "Evening (7pm)", value: "19:00", icon: "moon" },
];

export default function NotificationsSetup() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);

    if (enableNotifications) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Notifications",
          "You can enable notifications later in Settings."
        );
      }
    }

    await updateProfile({
      onboarding_completed: true,
    });

    setLoading(false);
  };

  const handleSkip = async () => {
    await updateProfile({
      onboarding_completed: true,
    });
  };

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Progress bar */}
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1B1B1B" />
          </TouchableOpacity>
          <Text className="text-sm text-gray-400">Step 3 of 3</Text>
        </View>
        <View className="h-1.5 bg-gray-200 rounded-full">
          <View className="h-1.5 bg-primary-500 rounded-full w-full" />
        </View>
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-gray-900">
          Stay on track
        </Text>
        <Text className="text-base text-gray-500 mt-1">
          Get daily savings tips and gentle reminders
        </Text>

        {/* Notification toggle */}
        <View className="bg-white rounded-2xl p-4 mt-8 flex-row items-center justify-between border border-gray-200">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
              <Ionicons name="notifications" size={20} color="#2D6A4F" />
            </View>
            <View className="ml-3">
              <Text className="text-base font-semibold text-gray-900">
                Daily tips
              </Text>
              <Text className="text-sm text-gray-500">
                One smart saving tip each day
              </Text>
            </View>
          </View>
          <Switch
            value={enableNotifications}
            onValueChange={setEnableNotifications}
            trackColor={{ false: "#D1D5DB", true: "#A7F3D0" }}
            thumbColor={enableNotifications ? "#2D6A4F" : "#9CA3AF"}
          />
        </View>

        {/* Time picker */}
        {enableNotifications && (
          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Best time for you?
            </Text>
            <View className="gap-3">
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot.value}
                  className={`flex-row items-center p-4 rounded-2xl border ${
                    selectedTime === slot.value
                      ? "bg-primary-50 border-primary-500"
                      : "bg-white border-gray-200"
                  }`}
                  onPress={() => setSelectedTime(slot.value)}
                >
                  <Ionicons
                    name={slot.icon as any}
                    size={22}
                    color={
                      selectedTime === slot.value ? "#2D6A4F" : "#6B7280"
                    }
                  />
                  <Text
                    className={`ml-3 text-base font-medium ${
                      selectedTime === slot.value
                        ? "text-primary-600"
                        : "text-gray-700"
                    }`}
                  >
                    {slot.label}
                  </Text>
                  {selectedTime === slot.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2D6A4F"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Reassurance */}
        <View className="bg-secondary-50 rounded-2xl p-4 mt-8 flex-row items-start">
          <Ionicons name="heart" size={20} color="#E9C46A" />
          <Text className="ml-3 text-sm text-gray-600 flex-1 leading-5">
            We'll never spam you. Just one helpful tip a day to keep your
            savings growing. You can change this anytime in Settings.
          </Text>
        </View>
      </View>

      {/* CTA */}
      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className="bg-primary-500 rounded-2xl py-4 items-center"
          onPress={handleFinish}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">
            {loading ? "Setting up..." : "Let's Go! 🎉"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 items-center mt-2"
          onPress={handleSkip}
        >
          <Text className="text-gray-400 text-sm">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
