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

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeIngredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];

export default function RecipeDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  const currencySymbol =
    profile?.currency === "USD" ? "$" : profile?.currency === "AUD" ? "A$" : "£";

  useEffect(() => {
    if (id) fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    const [recipeRes, ingredientsRes] = await Promise.all([
      supabase.from("recipes").select("*").eq("id", id).single(),
      supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", id)
        .order("ingredient_name"),
    ]);

    if (recipeRes.data) setRecipe(recipeRes.data);
    if (ingredientsRes.data) setIngredients(ingredientsRes.data);
    setLoading(false);
  };

  const handleClose = () => {
    if (router.canDismiss()) {
      router.dismiss();
    } else {
      router.back();
    }
  };

  if (loading || !recipe) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3">
        <TouchableOpacity
          onPress={handleClose}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200"
        >
          <Ionicons name="close" size={20} color="#1B1B1B" />
        </TouchableOpacity>
        <View className="bg-primary-50 rounded-full px-3 py-1.5">
          <Text className="text-primary-500 text-sm font-bold">
            {currencySymbol}{recipe.cost_per_serving.toFixed(2)}/serving
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          {recipe.title}
        </Text>
        <Text className="text-base text-gray-500 mt-2 leading-6">
          {recipe.description}
        </Text>

        {/* Stats Row */}
        <View className="flex-row mt-5 gap-3">
          <View className="flex-1 bg-white rounded-xl p-3 items-center border border-gray-100">
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-900 mt-1">
              {recipe.prep_time + recipe.cook_time} min
            </Text>
            <Text className="text-xs text-gray-400">Total time</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-3 items-center border border-gray-100">
            <Ionicons name="people-outline" size={20} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-900 mt-1">
              {recipe.servings}
            </Text>
            <Text className="text-xs text-gray-400">Servings</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-3 items-center border border-gray-100">
            <Ionicons name="cash-outline" size={20} color="#2D6A4F" />
            <Text className="text-sm font-semibold text-primary-500 mt-1">
              {currencySymbol}{recipe.total_cost.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-400">Total cost</Text>
          </View>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap mt-4 gap-2">
          {recipe.dietary_tags?.map((tag) => (
            <View key={tag} className="bg-green-50 rounded-full px-3 py-1">
              <Text className="text-xs text-green-700 font-medium">{tag}</Text>
            </View>
          ))}
          {recipe.freezer_friendly && (
            <View className="bg-blue-50 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="snow" size={12} color="#3B82F6" />
              <Text className="text-xs text-blue-700 font-medium ml-1">
                Freezer Friendly
              </Text>
            </View>
          )}
        </View>

        {/* Ingredients */}
        <Text className="text-lg font-bold text-gray-900 mt-8 mb-3">
          Ingredients
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {ingredients.map((ing, index) => (
            <View
              key={ing.id}
              className={`flex-row items-center p-4 ${
                index < ingredients.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <View className="w-6 h-6 rounded-full border border-gray-200 items-center justify-center">
                <View className="w-2 h-2 rounded-full bg-primary-300" />
              </View>
              <Text className="text-sm text-gray-800 ml-3 flex-1">
                {ing.quantity} {ing.unit} {ing.ingredient_name}
              </Text>
              <Text className="text-xs text-gray-400">
                {currencySymbol}{ing.estimated_cost.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <Text className="text-lg font-bold text-gray-900 mt-8 mb-3">
          Method
        </Text>
        <View className="gap-3">
          {recipe.instructions?.map((step, index) => (
            <View key={index} className="flex-row bg-white rounded-2xl p-4 border border-gray-100">
              <View className="w-7 h-7 rounded-full bg-primary-50 items-center justify-center mr-3 mt-0.5">
                <Text className="text-xs font-bold text-primary-500">
                  {index + 1}
                </Text>
              </View>
              <Text className="text-sm text-gray-700 flex-1 leading-5">
                {step}
              </Text>
            </View>
          ))}
        </View>

        {/* Cost comparison */}
        <View className="bg-secondary-50 rounded-2xl p-5 mt-6 mb-8">
          <Text className="text-base font-bold text-gray-900">
            Your savings
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            This meal costs {currencySymbol}{recipe.cost_per_serving.toFixed(2)} per
            person. A similar takeaway meal would cost around {currencySymbol}
            {(8).toFixed(2)} per person.
          </Text>
          <View className="bg-success/10 rounded-xl px-3 py-2 mt-3 self-start">
            <Text className="text-success font-bold">
              You save {currencySymbol}
              {((8 - recipe.cost_per_serving) * recipe.servings).toFixed(2)} for the
              whole family!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
