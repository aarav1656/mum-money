export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          family_size: number | null;
          kids_ages: number[] | null;
          location: string | null;
          currency: string;
          working_status: string | null;
          weekly_grocery_budget: number | null;
          monthly_savings_target: number | null;
          onboarding_completed: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          family_size?: number | null;
          kids_ages?: number[] | null;
          location?: string | null;
          currency?: string;
          working_status?: string | null;
          weekly_grocery_budget?: number | null;
          monthly_savings_target?: number | null;
          onboarding_completed?: boolean;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      swap_categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["swap_categories"]["Insert"]>;
      };
      smart_swaps: {
        Row: {
          id: string;
          category_id: string;
          original_item: string;
          original_brand: string;
          original_price: number;
          swap_item: string;
          swap_brand: string;
          swap_price: number;
          savings_amount: number;
          region: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          original_item: string;
          original_brand: string;
          original_price: number;
          swap_item: string;
          swap_brand: string;
          swap_price: number;
          savings_amount: number;
          region?: string;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["smart_swaps"]["Insert"]>;
      };
      user_swaps: {
        Row: {
          id: string;
          user_id: string;
          swap_id: string;
          logged_at: string;
          savings_amount: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          swap_id: string;
          savings_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_swaps"]["Insert"]>;
      };
      recipes: {
        Row: {
          id: string;
          title: string;
          description: string;
          prep_time: number;
          cook_time: number;
          servings: number;
          cost_per_serving: number;
          total_cost: number;
          difficulty: string;
          dietary_tags: string[];
          freezer_friendly: boolean;
          image_url: string | null;
          instructions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          prep_time: number;
          cook_time: number;
          servings: number;
          cost_per_serving: number;
          total_cost: number;
          difficulty?: string;
          dietary_tags?: string[];
          freezer_friendly?: boolean;
          image_url?: string | null;
          instructions: string[];
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          ingredient_name: string;
          quantity: number;
          unit: string;
          estimated_cost: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          ingredient_name: string;
          quantity: number;
          unit: string;
          estimated_cost: number;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_ingredients"]["Insert"]>;
      };
      savings_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          goal_type: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_amount: number;
          current_amount?: number;
          deadline?: string | null;
          goal_type: string;
          icon?: string;
        };
        Update: Partial<Database["public"]["Tables"]["savings_goals"]["Insert"]>;
      };
      savings_entries: {
        Row: {
          id: string;
          goal_id: string;
          amount: number;
          source: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          amount: number;
          source: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["savings_entries"]["Insert"]>;
      };
      learning_modules: {
        Row: {
          id: string;
          level: number;
          order_index: number;
          title: string;
          subtitle: string;
          content_type: string;
          content: string;
          duration_minutes: number;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: number;
          order_index: number;
          title: string;
          subtitle?: string;
          content_type?: string;
          content: string;
          duration_minutes: number;
          icon?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learning_modules"]["Insert"]>;
      };
      user_learning_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed: boolean;
          completed_at: string | null;
          quiz_score: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed?: boolean;
          quiz_score?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_learning_progress"]["Insert"]>;
      };
      savings_tips: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          content: string;
          estimated_savings: number;
          difficulty: string;
          time_to_implement: string;
          region: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          content: string;
          estimated_savings: number;
          difficulty?: string;
          time_to_implement?: string;
          region?: string;
        };
        Update: Partial<Database["public"]["Tables"]["savings_tips"]["Insert"]>;
      };
      tip_categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["tip_categories"]["Insert"]>;
      };
      user_tips_logged: {
        Row: {
          id: string;
          user_id: string;
          tip_id: string;
          logged_at: string;
          actual_savings: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_id: string;
          actual_savings?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_tips_logged"]["Insert"]>;
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          streak_type: string;
          current_count: number;
          longest_count: number;
          last_active_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak_type: string;
          current_count?: number;
          longest_count?: number;
          last_active_date?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_streaks"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          criteria_type: string;
          criteria_value: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          criteria_type: string;
          criteria_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Insert"]>;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_conversations"]["Insert"]>;
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_messages"]["Insert"]>;
      };
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_anonymous: boolean;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_anonymous?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["community_posts"]["Insert"]>;
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          duration_days: number;
          category: string;
          start_date: string;
          end_date: string;
          points: number;
          icon: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          duration_days: number;
          category: string;
          start_date: string;
          end_date: string;
          points: number;
          icon?: string;
        };
        Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
