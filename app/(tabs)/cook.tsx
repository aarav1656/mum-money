import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Under £1", value: "budget" },
  { label: "Quick (< 30 min)", value: "quick" },
  { label: "Freezer Friendly", value: "freezer" },
  { label: "Vegetarian", value: "vegetarian" },
];

export default function CookScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useEffect(() => {
    fetchRecipes();
  }, [activeFilter]);

  const fetchRecipes = async () => {
    setLoading(true);
    let query = supabase.from("recipes").select("*");

    switch (activeFilter) {
      case "budget":
        query = query.lte("cost_per_serving", 1);
        break;
      case "quick":
        query = query.lte("prep_time", 15).lte("cook_time", 15);
        break;
      case "freezer":
        query = query.eq("freezer_friendly", true);
        break;
      case "vegetarian":
        query = query.contains("dietary_tags", ["vegetarian"]);
        break;
    }

    const { data } = await query.order("cost_per_serving").limit(50);
    if (data) setRecipes(data);
    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "#10B981";
      case "Medium":
        return "#F59E0B";
      case "Hard":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mx-6 mb-3 border border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/(modals)/recipe-detail",
          params: { id: item.id },
        })
      }
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-gray-900">
            {item.title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View className="bg-primary-50 rounded-xl px-3 py-2 items-center">
          <Text className="text-primary-500 text-lg font-bold">
            {currencySymbol}{item.cost_per_serving.toFixed(2)}
          </Text>
          <Text className="text-primary-400 text-xs">/serving</Text>
        </View>
      </View>

      <View className="flex-row mt-3 gap-3">
        <View className="flex-row items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-600 ml-1">
            {item.prep_time + item.cook_time} min
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text className="text-xs text-gray-600 ml-1">
            {item.servings} servings
          </Text>
        </View>
        <View className="flex-row items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
          <View
            className="w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
          />
          <Text className="text-xs text-gray-600">{item.difficulty}</Text>
        </View>
        {item.freezer_friendly && (
          <View className="flex-row items-center bg-blue-50 rounded-lg px-2.5 py-1.5">
            <Ionicons name="snow" size={14} color="#3B82F6" />
            <Text className="text-xs text-blue-600 ml-1">Freezer</Text>
          </View>
        )}
      </View>

      {/* Total cost comparison */}
      <View className="bg-secondary-50 rounded-xl p-3 mt-3">
        <Text className="text-xs text-gray-600">
          Total: {currencySymbol}{item.total_cost.toFixed(2)} for {item.servings} servings
          {" — "}
          <Text className="text-primary-500 font-semibold">
            vs ~{currencySymbol}{(item.servings * 8).toFixed(2)} eating out
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Budget Recipes</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          Delicious meals that won't break the bank
        </Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6 mb-3"
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            className={`px-4 py-2 rounded-full ${
              activeFilter === filter.value
                ? "bg-primary-500"
                : "bg-white border border-gray-200"
            }`}
            onPress={() => setActiveFilter(filter.value)}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter.value ? "text-white" : "text-gray-600"
              }`}
            >
              {filter.label.replace("£", currencySymbol)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : recipes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-400 text-center mt-4">
            No recipes match this filter yet. More coming soon!
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
