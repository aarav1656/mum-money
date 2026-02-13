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
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign In Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-4">
            <Ionicons name="wallet" size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">MumMoney</Text>
          <Text className="text-base text-gray-500 mt-1">
            Save smarter. Grow what you have.
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
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
                placeholder="Enter your password"
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
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-primary-500 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
