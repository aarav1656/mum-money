import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type SavingsEntry = Database["public"]["Tables"]["savings_entries"]["Row"];
type UserSwap = Database["public"]["Tables"]["user_swaps"]["Row"];
type UserStreak = Database["public"]["Tables"]["user_streaks"]["Row"];

interface SavingsState {
  goals: SavingsGoal[];
  totalSavedThisWeek: number;
  totalSavedThisMonth: number;
  totalSavedAllTime: number;
  streak: UserStreak | null;
  recentSwaps: UserSwap[];
  isLoading: boolean;

  fetchGoals: (userId: string) => Promise<void>;
  createGoal: (goal: Database["public"]["Tables"]["savings_goals"]["Insert"]) => Promise<void>;
  addSavingsEntry: (entry: Database["public"]["Tables"]["savings_entries"]["Insert"]) => Promise<void>;
  logSwap: (userId: string, swapId: string, savingsAmount: number) => Promise<void>;
  fetchTotals: (userId: string) => Promise<void>;
  fetchStreak: (userId: string) => Promise<void>;
  updateStreak: (userId: string) => Promise<void>;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  goals: [],
  totalSavedThisWeek: 0,
  totalSavedThisMonth: 0,
  totalSavedAllTime: 0,
  streak: null,
  recentSwaps: [],
  isLoading: false,

  fetchGoals: async (userId) => {
    const { data } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) set({ goals: data });
  },

  createGoal: async (goal) => {
    const { data, error } = await supabase
      .from("savings_goals")
      .insert(goal)
      .select()
      .single();

    if (data && !error) {
      set((state) => ({ goals: [data, ...state.goals] }));
    }
  },

  addSavingsEntry: async (entry) => {
    const { data: entryData } = await supabase
      .from("savings_entries")
      .insert(entry)
      .select()
      .single();

    if (entryData) {
      // Update the goal's current_amount
      const goal = get().goals.find((g) => g.id === entry.goal_id);
      if (goal) {
        const newAmount = goal.current_amount + entry.amount;
        await supabase
          .from("savings_goals")
          .update({ current_amount: newAmount })
          .eq("id", goal.id);

        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goal.id ? { ...g, current_amount: newAmount } : g
          ),
        }));
      }
    }
  },

  logSwap: async (userId, swapId, savingsAmount) => {
    const { data } = await supabase
      .from("user_swaps")
      .insert({ user_id: userId, swap_id: swapId, savings_amount: savingsAmount })
      .select()
      .single();

    if (data) {
      set((state) => ({
        recentSwaps: [data, ...state.recentSwaps],
        totalSavedThisWeek: state.totalSavedThisWeek + savingsAmount,
        totalSavedThisMonth: state.totalSavedThisMonth + savingsAmount,
        totalSavedAllTime: state.totalSavedAllTime + savingsAmount,
      }));
      await get().updateStreak(userId);
    }
  },

  fetchTotals: async (userId) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch swap totals
    const { data: allSwaps } = await supabase
      .from("user_swaps")
      .select("savings_amount, logged_at")
      .eq("user_id", userId);

    // Fetch tip totals
    const { data: allTips } = await supabase
      .from("user_tips_logged")
      .select("actual_savings, logged_at")
      .eq("user_id", userId);

    let weekTotal = 0;
    let monthTotal = 0;
    let allTimeTotal = 0;

    const processEntries = (entries: { savings_amount?: number | null; actual_savings?: number | null; logged_at: string }[]) => {
      entries.forEach((entry) => {
        const amount = entry.savings_amount ?? entry.actual_savings ?? 0;
        const date = new Date(entry.logged_at);
        allTimeTotal += amount;
        if (date >= monthStart) monthTotal += amount;
        if (date >= weekStart) weekTotal += amount;
      });
    };

    if (allSwaps) processEntries(allSwaps);
    if (allTips) processEntries(allTips);

    set({
      totalSavedThisWeek: weekTotal,
      totalSavedThisMonth: monthTotal,
      totalSavedAllTime: allTimeTotal,
    });
  },

  fetchStreak: async (userId) => {
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .eq("streak_type", "daily_saving")
      .single();

    set({ streak: data ?? null });
  },

  updateStreak: async (userId) => {
    const today = new Date().toISOString().split("T")[0];
    const { streak } = get();

    if (streak) {
      if (streak.last_active_date === today) return; // Already active today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const newCount =
        streak.last_active_date === yesterdayStr
          ? streak.current_count + 1
          : 1;

      const longestCount = Math.max(newCount, streak.longest_count);

      const { data } = await supabase
        .from("user_streaks")
        .update({
          current_count: newCount,
          longest_count: longestCount,
          last_active_date: today,
        })
        .eq("id", streak.id)
        .select()
        .single();

      if (data) set({ streak: data });
    } else {
      const { data } = await supabase
        .from("user_streaks")
        .insert({
          user_id: userId,
          streak_type: "daily_saving",
          current_count: 1,
          longest_count: 1,
          last_active_date: today,
        })
        .select()
        .single();

      if (data) set({ streak: data });
    }
  },
}));
