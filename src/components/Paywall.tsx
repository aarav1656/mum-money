import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptionStore } from "@/store/subscriptionStore";

interface PaywallProps {
  onClose: () => void;
  feature?: string;
}

export default function Paywall({ onClose, feature }: PaywallProps) {
  const { purchasePackage, restorePurchases, isLoading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<"plus_annual" | "plus_monthly" | "pro_annual" | "pro_monthly">("plus_annual");

  const plans = [
    {
      id: "plus_annual" as const,
      name: "Plus Annual",
      price: "£3.33/mo",
      period: "£39.99 billed annually",
      badge: "Best Value",
      savings: "Save £20/year",
    },
    {
      id: "plus_monthly" as const,
      name: "Plus Monthly",
      price: "£4.99/mo",
      period: "Billed monthly",
      badge: null,
      savings: null,
    },
    {
      id: "pro_annual" as const,
      name: "Pro Annual",
      price: "£5.83/mo",
      period: "£69.99 billed annually",
      badge: "Most Popular",
      savings: "Save £38/year",
    },
    {
      id: "pro_monthly" as const,
      name: "Pro Monthly",
      price: "£8.99/mo",
      period: "Billed monthly",
      badge: null,
      savings: null,
    },
  ];

  const plusFeatures = [
    "Unlimited smart swaps",
    "Full recipe library + meal planner",
    "All investing lessons",
    "Savings goals with progress tracking",
    "Community forum access",
    "No ads",
  ];

  const proExtras = [
    "Everything in Plus, and:",
    "Personalised weekly savings reports",
    "Investment simulators",
    "Family budget collaboration",
    "Priority support",
    "Early access to new features",
  ];

  const handlePurchase = async () => {
    try {
      const success = await purchasePackage(selectedPlan);
      if (success) {
        onClose();
      }
    } catch (error) {
      Alert.alert("Purchase Error", "Something went wrong. Please try again.");
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
    Alert.alert("Restored", "Your purchases have been restored.");
  };

  const isPro = selectedPlan.startsWith("pro");

  return (
    <ScrollView className="flex-1 bg-cream" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-6 pb-8">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mb-3">
            <Ionicons name="star" size={32} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Unlock MumMoney {isPro ? "Pro" : "Plus"}
          </Text>
          {feature && (
            <Text className="text-sm text-gray-500 text-center mt-1">
              Upgrade to access {feature}
            </Text>
          )}
        </View>

        {/* Features */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-3">
            {isPro ? "Pro includes everything:" : "Plus includes:"}
          </Text>
          {(isPro ? proExtras : plusFeatures).map((feature, i) => (
            <View key={i} className="flex-row items-center mb-2.5">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={isPro ? "#EC4899" : "#2D6A4F"}
              />
              <Text className="text-sm text-gray-700 ml-2.5">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View className="gap-3 mb-6">
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              className={`flex-row items-center p-4 rounded-2xl border-2 ${
                selectedPlan === plan.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedPlan === plan.id
                    ? "border-primary-500"
                    : "border-gray-300"
                }`}
              >
                {selectedPlan === plan.id && (
                  <View className="w-3 h-3 rounded-full bg-primary-500" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-gray-900">
                    {plan.price}
                  </Text>
                  {plan.badge && (
                    <View className="bg-accent-500 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-xs text-white font-semibold">
                        {plan.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {plan.period}
                </Text>
              </View>
              {plan.savings && (
                <Text className="text-xs text-success font-semibold">
                  {plan.savings}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          className="bg-primary-500 rounded-2xl py-4 items-center"
          onPress={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Start 7-Day Free Trial
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-center text-xs text-gray-400 mt-3">
          Cancel anytime. No charge during trial.
        </Text>

        {/* Restore */}
        <TouchableOpacity
          className="items-center mt-4 py-2"
          onPress={handleRestore}
        >
          <Text className="text-sm text-primary-500">Restore Purchases</Text>
        </TouchableOpacity>

        {/* Close */}
        <TouchableOpacity className="items-center mt-2 py-2" onPress={onClose}>
          <Text className="text-sm text-gray-400">Maybe later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
