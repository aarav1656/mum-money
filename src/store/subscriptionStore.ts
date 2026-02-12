import { create } from "zustand";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import { Platform } from "react-native";

// RevenueCat API keys - replace with your own
const REVENUECAT_IOS_KEY = "your_ios_revenuecat_key";
const REVENUECAT_ANDROID_KEY = "your_android_revenuecat_key";

// Entitlement identifiers matching RevenueCat dashboard
export const ENTITLEMENTS = {
  PLUS: "plus",
  PRO: "pro",
} as const;

interface SubscriptionState {
  isPlus: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: (userId: string) => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchasePackage: (packageId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  checkEntitlements: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPlus: false,
  isPro: false,
  customerInfo: null,
  offerings: null,
  isLoading: false,
  initialized: false,

  initialize: async (userId: string) => {
    try {
      const apiKey =
        Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

      if (apiKey.startsWith("your_")) {
        // RevenueCat not configured yet - grant free access for development
        set({ initialized: true, isPlus: false, isPro: false });
        return;
      }

      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      const customerInfo = await Purchases.getCustomerInfo();
      set({ customerInfo, initialized: true });
      get().checkEntitlements();
    } catch (error) {
      console.log("RevenueCat init error:", error);
      set({ initialized: true });
    }
  },

  fetchOfferings: async () => {
    try {
      set({ isLoading: true });
      const offerings = await Purchases.getOfferings();
      set({
        offerings: offerings.current ?? null,
        isLoading: false,
      });
    } catch (error) {
      console.log("Offerings error:", error);
      set({ isLoading: false });
    }
  },

  purchasePackage: async (packageId: string) => {
    try {
      set({ isLoading: true });
      const { offerings } = get();
      if (!offerings) return false;

      const pkg = offerings.availablePackages.find(
        (p) => p.identifier === packageId
      );
      if (!pkg) return false;

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      set({ customerInfo, isLoading: false });
      get().checkEntitlements();
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      if (error.userCancelled) return false;
      throw error;
    }
  },

  restorePurchases: async () => {
    try {
      set({ isLoading: true });
      const customerInfo = await Purchases.restorePurchases();
      set({ customerInfo, isLoading: false });
      get().checkEntitlements();
    } catch (error) {
      set({ isLoading: false });
    }
  },

  checkEntitlements: () => {
    const { customerInfo } = get();
    if (!customerInfo) return;

    const isPlus =
      customerInfo.entitlements.active[ENTITLEMENTS.PLUS] !== undefined;
    const isPro =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;

    set({ isPlus: isPlus || isPro, isPro });
  },
}));
