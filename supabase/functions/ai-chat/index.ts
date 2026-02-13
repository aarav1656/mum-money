// Supabase Edge Function for AI Chat via OpenRouter
// Deploy with: supabase functions deploy ai-chat
// Set secret: supabase secrets set OPENROUTER_API_KEY=your_key_here

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { messages, userContext } = await req.json();

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ reply: "AI coach is being set up. Please check back soon!" }),
        { headers: corsHeaders }
      );
    }

    // Enhance system prompt with user context
    const enhancedMessages = messages.map((msg: any) => {
      if (msg.role === "system" && userContext) {
        return {
          ...msg,
          content: `${msg.content}\n\nUser context: Name: ${userContext.name ?? "Unknown"}, Currency: ${userContext.currency ?? "GBP"}, Location: ${userContext.location ?? "UK"}, Family size: ${userContext.familySize ?? "unknown"}.`,
        };
      }
      return msg;
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mummoney.app",
        "X-Title": "MumMoney AI Coach",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: enhancedMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("OpenRouter error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ reply: data.error?.message ?? "AI service temporarily unavailable." }),
        { headers: corsHeaders }
      );
    }

    const reply = data.choices?.[0]?.message?.content ?? "I'm having trouble right now. Please try again!";

    return new Response(
      JSON.stringify({ reply }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ reply: "Something went wrong. Please try again in a moment!" }),
      { headers: corsHeaders }
    );
  }
});
