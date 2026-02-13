import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

const FAMILY_SIZES = [
  { label: "Just me", value: 1, icon: "person" },
  { label: "Me + partner", value: 2, icon: "people" },
  { label: "Small family (3-4)", value: 3, icon: "home" },
  { label: "Big family (5+)", value: 5, icon: "home" },
];

const WORK_STATUSES = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Stay-at-home", value: "stay-at-home" },
  { label: "Freelance", value: "freelance" },
  { label: "On maternity", value: "maternity" },
];

const REGIONS = [
  { label: "🇬🇧 United Kingdom", value: "UK", currency: "GBP" },
  { label: "🇺🇸 United States", value: "US", currency: "USD" },
  { label: "🇦🇺 Australia", value: "AU", currency: "AUD" },
  { label: "🇮🇪 Ireland", value: "IE", currency: "EUR" },
  { label: "🇨🇦 Canada", value: "CA", currency: "CAD" },
];

export default function AboutYou() {
  const insets = useSafeAreaInsets();
  const { updateProfile, profile } = useAuthStore();
  const [familySize, setFamilySize] = useState<number | null>(null);
  const [workStatus, setWorkStatus] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [currency, setCurrency] = useState("GBP");
  const [kidsAgesText, setKidsAgesText] = useState("");

  const canContinue = familySize && workStatus && region;

  const handleContinue = async () => {
    if (!canContinue) return;

    const kidsAges = kidsAgesText
      .split(",")
      .map((a) => parseInt(a.trim()))
      .filter((a) => !isNaN(a));

    await updateProfile({
      family_size: familySize,
      working_status: workStatus,
      location: region,
      currency,
      kids_ages: kidsAges.length > 0 ? kidsAges : null,
    });

    router.push("/(onboarding)/your-goals");
  };

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Progress bar */}
      <View className="px-6 pt-4">
        <View className="flex-row items-center mb-2">
          <Text className="text-sm text-gray-400">Step 1 of 3</Text>
        </View>
        <View className="h-1.5 bg-gray-200 rounded-full">
          <View className="h-1.5 bg-primary-500 rounded-full w-1/3" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900">
          Tell us about you
        </Text>
        <Text className="text-base text-gray-500 mt-1">
          So we can personalise your experience
        </Text>

        {/* Family Size */}
        <Text className="text-base font-semibold text-gray-800 mt-8 mb-3">
          Your household
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {FAMILY_SIZES.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`flex-row items-center px-4 py-3 rounded-xl border ${
                familySize === item.value
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setFamilySize(item.value)}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={familySize === item.value ? "#2D6A4F" : "#6B7280"}
              />
              <Text
                className={`ml-2 text-sm font-medium ${
                  familySize === item.value
                    ? "text-primary-500"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Kids ages */}
        {familySize && familySize >= 3 && (
          <View className="mt-4">
            <Text className="text-sm text-gray-600 mb-1.5">
              Kids' ages (comma separated)
            </Text>
            <TextInput
              className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-base text-gray-900"
              placeholder="e.g. 3, 7, 12"
              placeholderTextColor="#9CA3AF"
              value={kidsAgesText}
              onChangeText={setKidsAgesText}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        )}

        {/* Work Status */}
        <Text className="text-base font-semibold text-gray-800 mt-8 mb-3">
          Work situation
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {WORK_STATUSES.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`px-4 py-3 rounded-xl border ${
                workStatus === item.value
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => setWorkStatus(item.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  workStatus === item.value
                    ? "text-primary-500"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Region */}
        <Text className="text-base font-semibold text-gray-800 mt-8 mb-3">
          Your region
        </Text>
        <View className="gap-2">
          {REGIONS.map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`flex-row items-center px-4 py-3.5 rounded-xl border ${
                region === item.value
                  ? "bg-primary-50 border-primary-500"
                  : "bg-white border-gray-200"
              }`}
              onPress={() => {
                setRegion(item.value);
                setCurrency(item.currency);
              }}
            >
              <Text className="text-base">{item.label}</Text>
              {region === item.value && (
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
