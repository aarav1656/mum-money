# MumMoney

**Financial independence for busy mums -- one smart swap at a time.**

MumMoney is a mobile app that helps mothers take control of their finances through practical, everyday savings strategies. Rather than complex budgeting tools, it focuses on actionable changes: swapping branded groceries for cheaper alternatives, batch-cooking budget meals, and building investing knowledge -- all guided by an AI financial coach.

Built for the hackathon with Expo SDK 54, React Native, and Supabase.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [License](#license)

---

## Features

### Smart Swaps
Curated database of cheaper alternatives for everyday products. Each swap shows the original branded item, the budget alternative, and the exact savings (e.g., swap Fairy for Aldi's Magnum dish soap, save £1.40). Users log each swap they make, and savings accumulate in their tracker.

### Budget Meals
Batch-cooking recipes designed for families on a budget. Each recipe includes cost per serving, total cost, prep/cook time, servings, difficulty rating, dietary tags, and freezer-friendliness. Full ingredient lists with estimated costs and step-by-step instructions.

### Learn to Invest
Bite-sized investing education organized across three levels: Beginner, Intermediate, and Advanced. Each module tracks completion status and quiz scores, letting users progress at their own pace through topics like ISAs, index funds, and compound interest.

### Penny -- AI Financial Coach
An AI-powered financial coach built on OpenRouter (GPT-4o-mini) via a Supabase Edge Function. Penny is personalized to each user's context -- name, currency, location, family size, and savings goals. Conversation history is persisted in the database. Premium feature gated behind the subscription paywall.

### Savings Tracker
Central dashboard showing total savings, active streaks, and progress toward user-defined goals. Savings entries are attributed to their source (swaps, tips, manual entries). Includes streak tracking to encourage daily engagement.

### Premium Subscriptions
RevenueCat-powered paywall offering two tiers:
- **Monthly**: £4.99/month
- **Annual**: £39.99/year (save 33%)
- Both include a 7-day free trial

Premium unlocks the AI coach, advanced learning modules, and additional swap categories.

### Onboarding Flow
Four-step onboarding sequence: Welcome screen, About You (name, family size, location, working status, grocery budget), Your Goals (savings targets, goal selection), and Notifications setup. Profile data feeds into personalized recommendations and AI coaching.

---


### Testing Instructions 



## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo SDK | 54 |
| UI | React Native | 0.81.5 |
| Navigation | expo-router | 6.x |
| Styling | NativeWind (Tailwind CSS) | 4.x |
| State Management | Zustand | 5.x |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions) | 2.95.x |
| Subscriptions | RevenueCat (react-native-purchases) | 9.8.0 |
| AI | OpenRouter API (GPT-4o-mini) | -- |
| Charts | react-native-gifted-charts | 1.4.x |
| Animations | react-native-reanimated | 4.1.x |
| Typography | Poppins (custom font family) | -- |
| Language | TypeScript | 5.9.x |
| Architecture | React Native New Architecture | Enabled |

---

## Architecture

```
Client (Expo / React Native)
    |
    |-- expo-router v6 (file-based routing)
    |       |-- (auth)        Sign-in, Sign-up
    |       |-- (onboarding)  Welcome, About You, Goals, Notifications
    |       |-- (tabs)        Home, Cook, Learn, Savings, Profile
    |       |-- (modals)      Swap Detail, Recipe Detail, AI Coach, Paywall
    |
    |-- Zustand stores
    |       |-- authStore          Session, profile, onboarding state
    |       |-- savingsStore       Goals, entries, streaks, totals
    |       |-- subscriptionStore  RevenueCat state, entitlements
    |
    |-- NativeWind v4 (Tailwind utility classes)
    |
    v
Supabase
    |-- Auth (email/password, auto-profile creation via trigger)
    |-- PostgreSQL (20 tables, all with Row Level Security)
    |-- Edge Functions (ai-chat: proxies to OpenRouter)
    |
RevenueCat
    |-- Subscription management
    |-- Paywall presentation (react-native-purchases-ui)
    |-- Entitlement checking
```

**Auth flow**: Root layout listens to Supabase auth state. Unauthenticated users are redirected to `(auth)`. Authenticated but un-onboarded users go to `(onboarding)`. Fully onboarded users land on `(tabs)`.

**AI flow**: The AI coach screen sends messages to a Supabase Edge Function (`ai-chat`), which forwards them to OpenRouter with the user's profile context injected as a system prompt. Conversation history is stored in `ai_conversations` and `ai_messages` tables.

**Subscription flow**: RevenueCat is initialized with the user's Supabase UID on login. The `subscriptionStore` checks entitlements and gates premium features. The paywall component uses `react-native-purchases-ui` for native presentation.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase project (with schema applied)
- RevenueCat account with configured products
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mum-money

# Install dependencies
npm install
```

### Environment Variables

Create environment variables in your EAS build profile or set them locally:

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=<your-revenuecat-ios-key>
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=<your-revenuecat-android-key>
```

The OpenRouter API key is configured in the Supabase Edge Function secrets.

### Database Setup

```bash
# Apply the schema migration
supabase db push

# Seed with sample data (swaps, recipes, learning modules)
supabase db seed
```

The seed file populates swap categories, smart swaps, recipes with ingredients, learning modules across all three levels, and achievements.

### Running the App

```bash
# Start the Expo dev server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android
```

### Test Account

For hackathon evaluation:

```
Email:    test@mummoney.dev
Password: TestPass1234
```

### Expo Project

- Published as: `@aarav1656/mum-money`
- EAS Dashboard: https://expo.dev/accounts/aarav1656/projects/mum-money

---

## Project Structure

```
mum-money/
├── app/
│   ├── _layout.tsx              # Root layout, auth guard, RevenueCat init
│   ├── index.tsx                # Entry redirect
│   ├── (auth)/
│   │   ├── sign-in.tsx          # Email/password sign-in
│   │   └── sign-up.tsx          # Registration with name field
│   ├── (onboarding)/
│   │   ├── welcome.tsx          # Welcome screen
│   │   ├── about-you.tsx        # Profile setup (family, location, budget)
│   │   ├── your-goals.tsx       # Savings goal selection
│   │   └── notifications.tsx    # Push notification permissions
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator config
│   │   ├── index.tsx            # Home -- swaps feed, daily tip
│   │   ├── cook.tsx             # Budget meals browser
│   │   ├── learn.tsx            # Investing lessons by level
│   │   ├── savings.tsx          # Savings tracker dashboard
│   │   └── profile.tsx          # Profile, settings, subscription
│   └── (modals)/
│       ├── swap-detail.tsx      # Individual swap comparison
│       ├── recipe-detail.tsx    # Full recipe view
│       ├── learning-module.tsx  # Lesson content reader
│       ├── ai-coach.tsx         # Penny AI chat interface
│       ├── add-savings.tsx      # Manual savings entry
│       └── tip-detail.tsx       # Savings tip detail
├── src/
│   ├── components/
│   │   └── Paywall.tsx          # RevenueCat paywall component
│   ├── constants/
│   │   └── colors.ts            # Design system color tokens
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   └── supabase.ts          # Supabase client initialization
│   ├── store/
│   │   ├── authStore.ts         # Auth state (Zustand)
│   │   ├── savingsStore.ts      # Savings state (Zustand)
│   │   └── subscriptionStore.ts # Subscription state (Zustand)
│   └── types/                   # TypeScript type definitions
├── supabase/
│   ├── migrations/              # SQL schema (20 tables + RLS + triggers)
│   ├── functions/
│   │   └── ai-chat/             # Edge Function for OpenRouter proxy
│   └── seed.sql                 # Sample data for swaps, recipes, lessons
├── assets/                      # App icons, splash screen, images
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build profiles
├── tailwind.config.js           # NativeWind/Tailwind theme
├── babel.config.js              # Babel with expo preset
├── metro.config.js              # Metro bundler config
├── tsconfig.json                # TypeScript configuration
└── global.css                   # Tailwind base imports
```

---

## Database Schema

The Supabase PostgreSQL database uses 20 tables, all protected with Row Level Security policies. A trigger automatically creates a profile row when a new user signs up via Supabase Auth.

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | User profiles (name, family size, location, currency, budget) | Own data only |
| `swap_categories` | Categories for smart swaps (Cleaning, Food, etc.) | Public read |
| `smart_swaps` | Product swap pairs with prices and savings amounts | Public read |
| `user_swaps` | Logged swaps per user with timestamps | Own data only |
| `recipes` | Budget meal recipes with cost, time, dietary info | Public read |
| `recipe_ingredients` | Ingredients per recipe with quantities and costs | Public read |
| `tip_categories` | Categories for savings tips | Public read |
| `savings_tips` | Actionable savings tips with estimated savings | Public read |
| `user_tips_logged` | Tips a user has acted on | Own data only |
| `savings_goals` | User-defined savings targets with deadlines | Own data only |
| `savings_entries` | Individual savings logged against goals | Own data only |
| `learning_modules` | Investing lessons (3 levels, ordered) | Public read |
| `user_learning_progress` | Completion and quiz scores per module | Own data only |
| `user_streaks` | Daily engagement streaks by type | Own data only |
| `achievements` | Achievement definitions with criteria | Public read |
| `user_achievements` | Earned achievements per user | Own data only |
| `ai_conversations` | AI coach conversation sessions | Own data only |
| `ai_messages` | Individual messages within AI conversations | Own data only |
| `community_posts` | User-submitted savings tips and stories | Public read, own write |
| `challenges` | Time-limited savings challenges | Public read |

---

## Design System

The app uses a warm, approachable color palette designed to feel trustworthy and calming:

| Role | Color | Hex |
|---|---|---|
| Primary (green) | Trust, action, navigation | `#2D6A4F` |
| Background (cream) | Warm, soft canvas | `#FEFAE0` |
| Accent (gold) | Highlights, achievements | `#E9C46A` |
| Secondary accent | Warmth, CTAs | `#F4A261` |
| Success | Positive feedback | `#10B981` |
| Error | Warnings, validation | `#EF4444` |

Typography uses the **Poppins** font family (Regular, Medium, SemiBold, Bold) configured through NativeWind's `fontFamily` extension.

---

## Screenshots

> Screenshots to be added. The app includes the following screens:
>
> - Onboarding flow (Welcome, About You, Your Goals, Notifications)
> - Home tab with smart swaps feed
> - Budget Meals browser with recipe detail
> - Learn to Invest with level-based progression
> - Savings tracker with goals and streaks
> - Penny AI coach chat interface
> - Profile and subscription management
> - RevenueCat paywall modal

---

## License

MIT License. See [LICENSE](LICENSE) for details.
