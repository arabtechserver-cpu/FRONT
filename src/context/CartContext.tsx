"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  groupName?: string | null;
  targetInput?: string | null;
  customFields?: Record<string, any> | null;
  quantity: number;
  price: number;
  notes?: string | null;
  image?: string | null;
  createdAt?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => Promise<boolean>;
  updateQuantity: (id: string, qty: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; message?: string; error?: string; orderIds?: string[] }>;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "guest_cart";

function generateGuestId(): string {
  return "guest_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check login state
  const checkLogin = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const session = localStorage.getItem("user_session");
      const token = localStorage.getItem("user_token");
      return Boolean(session || token);
    } catch {
      return false;
    }
  }, []);

  // Load guest cart from localStorage
  const loadGuestCart = useCallback((): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  }, []);

  // Save guest cart to localStorage
  const saveGuestCart = useCallback((items: CartItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event("cart_change"));
    } catch {
      // Ignore quota errors
    }
  }, []);

  // Fetch cart from backend API for logged-in user
  const fetchServerCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/cart", {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCartItems(data.items);
          return data.items;
        }
      }
    } catch (e) {
      console.error("Failed to fetch cart from server:", e);
    }
    return null;
  }, []);

  // Sync guest cart to server after login
  const syncGuestCart = useCallback(async () => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/cart/sync", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ items: guestItems }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCartItems(data.items);
          localStorage.removeItem(GUEST_CART_KEY);
          window.dispatchEvent(new Event("cart_change"));
        }
      }
    } catch (e) {
      console.error("Failed to sync guest cart:", e);
    }
  }, [loadGuestCart]);

  // Initial load & listeners
  useEffect(() => {
    const logged = checkLogin();
    setIsLoggedIn(logged);

    if (logged) {
      // Try to sync any pending guest items first, then fetch server cart
      const guestItems = loadGuestCart();
      if (guestItems.length > 0) {
        syncGuestCart().finally(() => setIsLoading(false));
      } else {
        fetchServerCart().finally(() => setIsLoading(false));
      }
    } else {
      setCartItems(loadGuestCart());
      setIsLoading(false);
    }

    const handleSessionChange = () => {
      const isNowLogged = checkLogin();
      setIsLoggedIn(isNowLogged);
      if (isNowLogged) {
        syncGuestCart().then(() => fetchServerCart());
      } else {
        setCartItems(loadGuestCart());
      }
    };

    const handleCartChange = () => {
      if (!checkLogin()) {
        setCartItems(loadGuestCart());
      }
    };

    window.addEventListener("user_session_change", handleSessionChange);
    window.addEventListener("cart_change", handleCartChange);

    return () => {
      window.removeEventListener("user_session_change", handleSessionChange);
      window.removeEventListener("cart_change", handleCartChange);
    };
  }, [checkLogin, loadGuestCart, syncGuestCart, fetchServerCart]);

  // Add Item to Cart
  const addToCart = useCallback(
    async (item: Omit<CartItem, "id">): Promise<boolean> => {
      const logged = checkLogin();

      if (logged) {
        try {
          const token = localStorage.getItem("user_token");
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch("/api/cart", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify(item),
          });

          if (res.ok) {
            await fetchServerCart();
            setIsCartOpen(true);
            return true;
          }
        } catch (e) {
          console.error("Error adding to server cart:", e);
        }
      }

      // Guest flow: add locally in localStorage
      const current = loadGuestCart();
      const cleanTarget = item.targetInput ? String(item.targetInput).trim() : "";
      const serializedCustom = JSON.stringify(item.customFields || {});

      const existingIndex = current.findIndex(
        (ci) =>
          ci.serviceId === item.serviceId &&
          (ci.targetInput || "") === cleanTarget &&
          JSON.stringify(ci.customFields || {}) === serializedCustom
      );

      let updated: CartItem[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex].quantity += item.quantity || 1;
        if (item.price > 0) updated[existingIndex].price = item.price;
      } else {
        const newItem: CartItem = {
          ...item,
          id: generateGuestId(),
          quantity: item.quantity || 1,
          createdAt: new Date().toISOString(),
        };
        updated = [newItem, ...current];
      }

      saveGuestCart(updated);
      setCartItems(updated);
      setIsCartOpen(true);
      return true;
    },
    [checkLogin, fetchServerCart, loadGuestCart, saveGuestCart]
  );

  // Update quantity
  const updateQuantity = useCallback(
    async (id: string, qty: number) => {
      const logged = checkLogin();

      if (logged) {
        try {
          const token = localStorage.getItem("user_token");
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          await fetch(`/api/cart/${id}`, {
            method: "PUT",
            headers,
            credentials: "include",
            body: JSON.stringify({ quantity: qty }),
          });

          await fetchServerCart();
          return;
        } catch (e) {
          console.error("Error updating cart quantity:", e);
        }
      }

      // Guest flow
      const current = loadGuestCart();
      if (qty <= 0) {
        const filtered = current.filter((it) => it.id !== id);
        saveGuestCart(filtered);
        setCartItems(filtered);
      } else {
        const updated = current.map((it) => (it.id === id ? { ...it, quantity: qty } : it));
        saveGuestCart(updated);
        setCartItems(updated);
      }
    },
    [checkLogin, fetchServerCart, loadGuestCart, saveGuestCart]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    async (id: string) => {
      const logged = checkLogin();

      if (logged) {
        try {
          const token = localStorage.getItem("user_token");
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          await fetch(`/api/cart/${id}`, {
            method: "DELETE",
            headers,
            credentials: "include",
          });

          await fetchServerCart();
          return;
        } catch (e) {
          console.error("Error removing from cart:", e);
        }
      }

      // Guest flow
      const current = loadGuestCart();
      const filtered = current.filter((it) => it.id !== id);
      saveGuestCart(filtered);
      setCartItems(filtered);
    },
    [checkLogin, fetchServerCart, loadGuestCart, saveGuestCart]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const logged = checkLogin();

    if (logged) {
      try {
        const token = localStorage.getItem("user_token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch("/api/cart", {
          method: "DELETE",
          headers,
          credentials: "include",
        });

        await fetchServerCart();
      } catch (e) {
        console.error("Error clearing cart on server:", e);
      }
    }

    // Also clear localStorage
    localStorage.removeItem(GUEST_CART_KEY);
    setCartItems([]);
    window.dispatchEvent(new Event("cart_change"));
  }, [checkLogin, fetchServerCart]);

  // Checkout from cart
  const checkout = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    orderIds?: string[];
  }> => {
    const logged = checkLogin();
    if (!logged) {
      return {
        success: false,
        error: "AUTH_REQUIRED",
      };
    }

    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchServerCart();
        window.dispatchEvent(new Event("user_session_change"));
        return {
          success: true,
          message: data.message,
          orderIds: data.orderIds,
        };
      } else {
        return {
          success: false,
          error: data.error || "فشل إتمام الشراء، يرجى المحاولة لاحقاً",
        };
      }
    } catch {
      return {
        success: false,
        error: "تعذر الاتصال بالسيرفر! يرجى التحقق من اتصالك بالإنترنت",
      };
    }
  }, [checkLogin, fetchServerCart]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () =>
      Number(
        cartItems
          .reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)
          .toFixed(2)
      ),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncGuestCart,
        checkout,
        isLoading,
        isLoggedIn,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
