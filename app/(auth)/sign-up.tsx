import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign Up Error", error.message);
      return;
    }

    if (data.user) {
      // Create profile (upsert to handle re-signups)
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim().toLowerCase(),
        name,
        currency: "GBP",
        onboarding_completed: false,
      });
    }

    if (data.session) {
      // Signed in immediately (email confirmation disabled)
      return;
    }

    // Email confirmation required
    Alert.alert(
      "Check your email",
      "We sent a confirmation link to " + email.trim().toLowerCase() + ". Please verify your email to continue.",
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-4">
            <Ionicons name="wallet" size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Join MumMoney</Text>
          <Text className="text-base text-gray-500 mt-1">
            Start saving smarter today
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Your Name
            </Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3.5 border border-gray-200">
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.text.secondary}
              />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="e.g. Rebecca"
                placeholderTextColor={Colors.text.light}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Email
            </Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3.5 border border-gray-200">
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.text.secondary}
              />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="your@email.com"
                placeholderTextColor={Colors.text.light}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3.5 border border-gray-200">
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.text.secondary}
              />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900"
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 items-center mt-6"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
