import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Penny, a warm and encouraging AI financial coach inside the MumMoney app. You help busy mums with:
- Everyday money-saving tips (grocery swaps, batch cooking, bill reduction)
- Budget-friendly meal ideas and cost comparisons
- Simple investing education (explain concepts in plain English)
- Motivational support for savings goals

IMPORTANT RULES:
- Never give specific investment advice (don't say "buy X stock" or "invest in Y")
- Always include a disclaimer when discussing investments: "This is educational info, not financial advice."
- Be warm, supportive, and never condescending
- Keep responses concise (2-3 short paragraphs max)
- Use British English by default unless the user clearly uses American English
- Suggest actionable next steps when possible
- If asked about complex financial situations, recommend consulting a qualified financial adviser`;

const QUICK_PROMPTS = [
  "What's a cheap meal for tonight?",
  "How can I start investing with £50?",
  "Tips to cut my grocery bill",
  "Explain index funds simply",
];

export default function AICoach() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${profile?.name?.split(" ")[0] ?? "there"}! I'm Penny, your money coach. I'm here to help with saving tips, meal ideas, and investing questions. What's on your mind today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (text?: string) => {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: messageText },
          ],
          userContext: {
            name: profile?.name,
            currency: profile?.currency,
            location: profile?.location,
            familySize: profile?.family_size,
          },
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data?.reply ||
          "I'm having trouble thinking right now. Please try again in a moment!",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I'm having a moment! Please check your connection and try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (router.canDismiss()) router.dismiss();
    else router.back();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`px-6 mb-3 ${
        item.role === "user" ? "items-end" : "items-start"
      }`}
    >
      {item.role === "assistant" && (
        <View className="flex-row items-center mb-1">
          <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
            <Text className="text-white text-xs">P</Text>
          </View>
          <Text className="text-xs text-gray-400 ml-2">Penny</Text>
        </View>
      )}
      <View
        className={`rounded-2xl px-4 py-3 max-w-[85%] ${
          item.role === "user"
            ? "bg-primary-500 rounded-br-sm"
            : "bg-white border border-gray-100 rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-sm leading-5 ${
            item.role === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center">
            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          </View>
          <View className="ml-3">
            <Text className="text-base font-bold text-gray-900">
              Penny - AI Coach
            </Text>
            <Text className="text-xs text-gray-400">
              Your money-saving companion
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Quick prompts (only if few messages) */}
      {messages.length <= 2 && (
        <View className="px-6 pb-2">
          <View className="flex-row flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                className="bg-white border border-gray-200 rounded-full px-3 py-2"
                onPress={() => handleSend(prompt)}
              >
                <Text className="text-xs text-gray-600">{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View className="px-6 pb-2 flex-row items-center">
          <View className="w-6 h-6 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-primary-500 text-xs">P</Text>
          </View>
          <ActivityIndicator size="small" color="#2D6A4F" className="ml-2" />
          <Text className="text-xs text-gray-400 ml-2">Penny is thinking...</Text>
        </View>
      )}

      {/* Input */}
      <View
        className="flex-row items-end px-4 py-3 border-t border-gray-100 bg-white"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <TextInput
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 max-h-24"
          placeholder="Ask Penny anything..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center ml-2 ${
            input.trim() ? "bg-primary-500" : "bg-gray-200"
          }`}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() ? "#fff" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
