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
import { PurchasesPackage } from "react-native-purchases";

interface PaywallProps {
  onClose: () => void;
  feature?: string;
}

export default function Paywall({ onClose, feature }: PaywallProps) {
  const { packages, purchasePackage, restorePurchases, isLoading } =
    useSubscriptionStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find monthly and annual packages from RevenueCat
  const monthlyPkg = packages.find(
    (p) => p.identifier.includes("monthly") || p.identifier === "$rc_monthly"
  );
  const annualPkg = packages.find(
    (p) => p.identifier.includes("annual") || p.identifier === "$rc_annual"
  );

  const hasRealPackages = monthlyPkg || annualPkg;

  // Calculate savings for annual
  const savingsPercent =
    monthlyPkg && annualPkg
      ? Math.round(
          ((monthlyPkg.product.price * 12 - annualPkg.product.price) /
            (monthlyPkg.product.price * 12)) *
            100
        )
      : 50;

  interface PlanDisplay {
    label: string;
    priceLabel: string;
    period: string;
    badge: string | null;
    savings: string | null;
    pkg: PurchasesPackage | null;
  }

  const plans: PlanDisplay[] = hasRealPackages
    ? [
        annualPkg
          ? {
              label: "Annual",
              priceLabel: annualPkg.product.priceString + "/year",
              period: `Just ${(annualPkg.product.price / 12).toFixed(2)}/mo`,
              badge: "Best Value",
              savings: `Save ${savingsPercent}%`,
              pkg: annualPkg,
            }
          : null,
        monthlyPkg
          ? {
              label: "Monthly",
              priceLabel: monthlyPkg.product.priceString + "/mo",
              period: "Cancel anytime",
              badge: null,
              savings: null,
              pkg: monthlyPkg,
            }
          : null,
      ].filter(Boolean) as PlanDisplay[]
    : [
        {
          label: "Annual",
          priceLabel: "£39.99/year",
          period: "Just £3.33/mo",
          badge: "Best Value",
          savings: "Save 50%",
          pkg: null,
        },
        {
          label: "Monthly",
          priceLabel: "£4.99/mo",
          period: "Cancel anytime",
          badge: null,
          savings: null,
          pkg: null,
        },
      ];

  const features = [
    { icon: "chatbubble-ellipses" as const, text: "Unlimited AI Coach conversations" },
    { icon: "restaurant" as const, text: "Full recipe library + meal planner" },
    { icon: "school" as const, text: "All investing lessons" },
    { icon: "bar-chart" as const, text: "Investment simulators" },
    { icon: "flag" as const, text: "Savings goals with progress tracking" },
    { icon: "people" as const, text: "Family budget collaboration" },
    { icon: "flash" as const, text: "Priority support & early access" },
  ];

  const handlePurchase = async () => {
    const selectedPlan = plans[selectedIndex];
    if (!selectedPlan?.pkg) {
      Alert.alert(
        "Not Available Yet",
        "Subscriptions are being configured. Please check back soon!"
      );
      return;
    }

    try {
      const success = await purchasePackage(selectedPlan.pkg);
      if (success) {
        Alert.alert("Welcome to Premium!", "You now have full access to all features.");
        onClose();
      }
    } catch (error) {
      Alert.alert("Purchase Error", "Something went wrong. Please try again.");
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert("Restored!", "Your premium access has been restored.");
      onClose();
    } else {
      Alert.alert("No Purchases Found", "We couldn't find any previous purchases.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-cream" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-6 pb-8">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mb-3">
            <Ionicons name="star" size={32} color="#FCD34D" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Unlock MumMoney Premium
          </Text>
          {feature && (
            <Text className="text-sm text-gray-500 text-center mt-1">
              Upgrade to access {feature}
            </Text>
          )}
          <Text className="text-sm text-gray-400 text-center mt-1">
            7-day free trial, cancel anytime
          </Text>
        </View>

        {/* Features */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Premium includes:
          </Text>
          {features.map((f, i) => (
            <View key={i} className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                <Ionicons name={f.icon} size={16} color="#2D6A4F" />
              </View>
              <Text className="text-sm text-gray-700 ml-3 flex-1">{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View className="gap-3 mb-6">
          {plans.map((plan, index) => (
            <TouchableOpacity
              key={plan.label}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 rounded-2xl border-2 ${
                selectedIndex === index
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() => setSelectedIndex(index)}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedIndex === index
                    ? "border-primary-500"
                    : "border-gray-300"
                }`}
              >
                {selectedIndex === index && (
                  <View className="w-3 h-3 rounded-full bg-primary-500" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-gray-900">
                    {plan.priceLabel}
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
          activeOpacity={0.7}
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
          activeOpacity={0.7}
          className="items-center mt-4 py-2"
          onPress={handleRestore}
        >
          <Text className="text-sm text-primary-500">Restore Purchases</Text>
        </TouchableOpacity>

        {/* Close */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="items-center mt-2 py-2"
          onPress={onClose}
        >
          <Text className="text-sm text-gray-400">Maybe later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
