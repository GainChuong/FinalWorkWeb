"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// ======= TYPES =======
export interface UserData {
  username: string;
  email: string;
  phone: string;
  joinDate: string;
  greenCoin: number;
  photoUrl?: string;
  authProvider?: "local" | "google";
  role?: "Buyer" | "Seller" | "Admin";
  redirect?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  priceStr: string;
  image: string;
  quantity: number;
  ecoScore: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  totalStr: string;
  greenCoinEarned: number;
  date: string;
  status: "processing" | "shipped" | "delivered";
}

export interface DonationRecord {
  id: string;
  clothingType: string;
  quantity: number;
  condition: string;
  address: string;
  coinEarned: number;
  date: string;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number;  // percent
  description: string;
  expiresAt: string;
  isUsed: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  cart: CartItem[];
  orders: Order[];
  donations: DonationRecord[];
  vouchers: Voucher[];

  login: (email: string, password: string) => boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;

  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;

  placeOrder: () => Order | null;
  placeOrderWithDetails: (params: {
    items: CartItem[];
    discountPercent: number;
    voucherCode?: string;
    phone: string;
    address: string;
    note?: string;
  }) => Order | null;
  addDonation: (donation: Omit<DonationRecord, "id" | "date" | "coinEarned">) => number;
  addGreenCoin: (amount: number) => void;
  spendGreenCoin: (amount: number) => boolean;

  redeemVoucher: (cost: number, discount: number, description: string) => Voucher | null;
  applyVoucher: (code: string) => Voucher | null;
  markVoucherUsed: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based accounts (mirrors datasets/accounts.json)
const ROLE_ACCOUNTS = [
  { email: "buyer@refashion.vn",  password: "buyer123",  role: "Buyer"  as const, name: "Người Mua Demo",   redirect: "/buyer/index.html" },
  { email: "seller@refashion.vn", password: "seller123", role: "Seller" as const, name: "Designer Studio",  redirect: "/seller/seller_dashboard.html" },
  { email: "admin@refashion.vn",  password: "admin123",  role: "Admin"  as const, name: "Admin ReFashion",  redirect: "/admin/index.html" },
];

// Legacy demo account
const DEMO_ACCOUNT = {
  email: "refashion@gmail.com",
  password: "1234567890@Abc",
  username: "ReFashion Demo",
  phone: "0912 345 678",
};

// ======= HELPER: localStorage =======
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ======= PROVIDER =======
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedUser = loadFromStorage<UserData | null>("refashion_current_user", null);
    const savedCart = loadFromStorage<CartItem[]>("refashion_cart", []);
    const savedOrders = loadFromStorage<Order[]>("refashion_orders", []);
    const savedDonations = loadFromStorage<DonationRecord[]>("refashion_donations", []);
    const savedVouchers = loadFromStorage<Voucher[]>("refashion_vouchers", []);

    if (savedUser) setUser(savedUser);
    setCart(savedCart);
    setOrders(savedOrders);
    setDonations(savedDonations);
    setVouchers(savedVouchers);
    setHydrated(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      saveToStorage("refashion_current_user", user);
    } else {
      localStorage.removeItem("refashion_current_user");
    }
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("refashion_cart", cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("refashion_orders", orders);
  }, [orders, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("refashion_donations", donations);
  }, [donations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("refashion_vouchers", vouchers);
  }, [vouchers, hydrated]);

  // ======= AUTH METHODS =======
  const login = useCallback((email: string, password: string): boolean => {
    // 1. Check role-based accounts (buyer / seller / admin)
    const roleAccount = ROLE_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );
    if (roleAccount) {
      const userData: UserData = {
        username: roleAccount.name,
        email: roleAccount.email,
        phone: "",
        joinDate: new Date().toLocaleDateString("vi-VN"),
        greenCoin: 100,
        role: roleAccount.role,
        redirect: roleAccount.redirect,
      };
      setUser(userData);
      // Write to localStorage immediately so redirect can be read synchronously
      saveToStorage("refashion_current_user", userData);
      return true;
    }

    // 2. Check legacy demo account
    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      setUser({
        username: DEMO_ACCOUNT.username,
        email: DEMO_ACCOUNT.email,
        phone: DEMO_ACCOUNT.phone,
        joinDate: "01/01/2026",
        greenCoin: 500,
        role: "Buyer",
      });
      return true;
    }

    // 3. Check registered users (localStorage)
    const users = loadFromStorage<Array<{
      username: string;
      email: string;
      phone: string;
      password: string;
      greenCoin?: number;
      joinDate?: string;
    }>>("refashion_users", []);

    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser({
        username: found.username,
        email: found.email,
        phone: found.phone || "",
        joinDate: found.joinDate || new Date().toLocaleDateString("vi-VN"),
        greenCoin: found.greenCoin ?? 100,
        role: "Buyer",
      });
      return true;
    }

    return false;
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      setUser({
        username: firebaseUser.displayName || "Google User",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        joinDate: new Date().toLocaleDateString("vi-VN"),
        greenCoin: 100,
        photoUrl: firebaseUser.photoURL || undefined,
        authProvider: "google",
      });
      return true;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error("Google sign-in error:", err.code, err.message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    // Sign out from Firebase if applicable
    try {
      await signOut(auth);
    } catch {
      // Ignore Firebase sign-out errors (user may not have signed in via Firebase)
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem("refashion_current_user");
    localStorage.removeItem("refashion_cart");
  }, []);

  // ======= CART METHODS =======
  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === item.productId);
      if (existing) {
        return prev.map((c) =>
          c.productId === item.productId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.productId === productId ? { ...c, quantity } : c))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartCount = useCallback(() => {
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  }, [cart]);

  // ======= ORDER METHODS =======
  const placeOrder = useCallback((): Order | null => {
    if (cart.length === 0 || !user) return null;

    const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const greenCoinEarned = Math.floor(total / 100000) * 5; // 5 coin per 100k spent

    const newOrder: Order = {
      id: `RF-${Date.now().toString(36).toUpperCase()}`,
      items: [...cart],
      total,
      totalStr: total.toLocaleString("vi-VN") + " đ",
      greenCoinEarned,
      date: new Date().toLocaleDateString("vi-VN"),
      status: "processing",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin + greenCoinEarned } : null);
    setCart([]);

    return newOrder;
  }, [cart, user]);

  // Enhanced placeOrder for checkout page
  const placeOrderWithDetails = useCallback((
    params: {
      items: CartItem[];
      discountPercent: number;
      voucherCode?: string;
      phone: string;
      address: string;
      note?: string;
    }
  ): Order | null => {
    if (params.items.length === 0 || !user) return null;

    const subtotal = params.items.reduce((sum, c) => sum + c.price * c.quantity, 0);
    const discountAmount = Math.floor(subtotal * params.discountPercent / 100);
    const total = subtotal - discountAmount;
    const greenCoinEarned = Math.floor(total / 100000) * 5;

    const newOrder: Order = {
      id: `RF-${Date.now().toString(36).toUpperCase()}`,
      items: [...params.items],
      total,
      totalStr: total.toLocaleString("vi-VN") + " \u0111",
      greenCoinEarned,
      date: new Date().toLocaleDateString("vi-VN"),
      status: "processing",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin + greenCoinEarned } : null);

    // Mark voucher as used if applied
    if (params.voucherCode) {
      setVouchers((prev) => prev.map((v) =>
        v.code === params.voucherCode ? { ...v, isUsed: true } : v
      ));
    }

    // Clear cart items that were ordered
    setCart((prev) => {
      const orderedIds = new Set(params.items.map(i => i.productId));
      return prev.filter(c => !orderedIds.has(c.productId));
    });

    return newOrder;
  }, [user]);

  // ======= DONATION & GREENCOIN =======
  const addDonation = useCallback(
    (donation: Omit<DonationRecord, "id" | "date" | "coinEarned">): number => {
      const coinEarned = donation.quantity * 15;

      const record: DonationRecord = {
        ...donation,
        id: `DON-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toLocaleDateString("vi-VN"),
        coinEarned,
      };

      setDonations((prev) => [record, ...prev]);
      setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin + coinEarned } : null);

      return coinEarned;
    },
    []
  );

  const addGreenCoin = useCallback((amount: number) => {
    setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin + amount } : null);
  }, []);

  const spendGreenCoin = useCallback(
    (amount: number): boolean => {
      if (!user || user.greenCoin < amount) return false;
      setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin - amount } : null);
      return true;
    },
    [user]
  );

  // ======= VOUCHER METHODS =======
  const redeemVoucher = useCallback(
    (cost: number, discount: number, description: string): Voucher | null => {
      if (!user || user.greenCoin < cost) return null;

      // Generate random voucher code
      const code = `RF${discount}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30 days expiry

      const newVoucher: Voucher = {
        id: `V-${Date.now().toString(36).toUpperCase()}`,
        code,
        discount,
        description,
        expiresAt: expires.toLocaleDateString("vi-VN"),
        isUsed: false,
      };

      setVouchers((prev) => [newVoucher, ...prev]);
      setUser((prev) => prev ? { ...prev, greenCoin: prev.greenCoin - cost } : null);

      return newVoucher;
    },
    [user]
  );

  const applyVoucher = useCallback(
    (code: string): Voucher | null => {
      const found = vouchers.find(
        (v) => v.code.toUpperCase() === code.toUpperCase() && !v.isUsed
      );
      return found || null;
    },
    [vouchers]
  );

  const markVoucherUsed = useCallback((code: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.code.toUpperCase() === code.toUpperCase() ? { ...v, isUsed: true } : v))
    );
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    cart,
    orders,
    donations,
    vouchers,
    login,
    loginWithGoogle,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    placeOrder,
    placeOrderWithDetails,
    addDonation,
    addGreenCoin,
    spendGreenCoin,
    redeemVoucher,
    applyVoucher,
    markVoucherUsed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ======= HOOK =======
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
