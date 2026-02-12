import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isOnboarded: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },

  setProfile: (profile) => {
    set({
      profile,
      isOnboarded: profile?.onboarding_completed ?? false,
    });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      set({
        profile: data,
        isOnboarded: data.onboarding_completed,
      });
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (data && !error) {
      set({
        profile: data,
        isOnboarded: data.onboarding_completed,
      });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      isOnboarded: false,
    });
  },

  initialize: async () => {
    set({ isLoading: true });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      set({ session, user: session.user });
      await get().fetchProfile();
    }

    set({ isLoading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        get().fetchProfile();
      } else {
        set({ profile: null, isOnboarded: false });
      }
    });
  },
}));
