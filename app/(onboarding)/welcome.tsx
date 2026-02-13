import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      <View className="flex-1 justify-center items-center px-8">
        {/* Hero Icon */}
        <View className="w-32 h-32 rounded-full bg-primary-100 items-center justify-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary-500 items-center justify-center">
            <Ionicons name="wallet" size={48} color="#fff" />
          </View>
        </View>

        <Text className="text-4xl font-bold text-gray-900 text-center">
          Welcome to{"\n"}MumMoney
        </Text>

        <Text className="text-lg text-gray-500 text-center mt-4 leading-7">
          Practical money-saving tips, budget-friendly recipes, and
          bite-sized investing lessons — designed for busy mums.
        </Text>

        {/* Feature highlights */}
        <View className="mt-10 w-full space-y-4">
          {[
            {
              icon: "swap-horizontal" as const,
              title: "Smart Swaps",
              desc: "Find cheaper alternatives for everyday items",
            },
            {
              icon: "restaurant" as const,
              title: "Budget Meals",
              desc: "Batch cook delicious meals from £1/serving",
            },
            {
              icon: "trending-up" as const,
              title: "Learn to Invest",
              desc: "Bite-sized lessons, no jargon",
            },
          ].map((item, i) => (
            <View
              key={i}
              className="flex-row items-center bg-white rounded-2xl p-4 mt-3"
            >
              <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center">
                <Ionicons name={item.icon} size={24} color="#2D6A4F" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View className="px-6 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          className="bg-primary-500 rounded-2xl py-4 items-center"
          onPress={() => router.push("/(onboarding)/about-you")}
        >
          <Text className="text-white text-lg font-semibold">
            Let's Get Started
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mt-3">
          Takes less than 2 minutes to set up
        </Text>
      </View>
    </View>
  );
}
