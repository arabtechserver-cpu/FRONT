"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { requestCart } from '@/lib/cart-api';
import { getUserAuthToken } from '@/lib/client-auth-token';

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  groupName?: string | null;
  targetInput?: string | null;
  customFields?: Record<string, any> | null;
  quantity: number;
  price: number;
  total?: number;
  quoteError?: string;
  notes?: string | null;
  image?: string | null;
  createdAt?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartError: string | null;
  walletBalance: number | null;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const syncPending = useRef<Promise<void> | null>(null);

  const checkLogin = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('user_session') || getUserAuthToken(localStorage));
  }, []);

  const loadGuestCart = useCallback((): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const items = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      return Array.isArray(items) ? items : [];
    } catch { return []; }
  }, []);

  const saveGuestCart = useCallback((items: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('cart_change'));
  }, []);

  const serverRequest = useCallback(async (path: string, options: { method?: string; body?: string } = {}) => {
    try {
      const data = await requestCart(fetch, localStorage, path, options);
      if (typeof data.balance === 'number') setWalletBalance(data.balance);
      setCartError(null);
      setIsLoggedIn(true);
      return data;
    } catch (error: any) {
      setCartError(error.message);
      if (typeof error.data?.balance === 'number') setWalletBalance(error.data.balance);
      if (error.status === 401) {
        // A cached profile is not proof of a valid login. Keep guest items so
        // they can be synchronized after the customer signs in again.
        localStorage.removeItem('user_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_session');
        setIsLoggedIn(false);
        setWalletBalance(null);
        window.dispatchEvent(new Event('user_session_change'));
      }
      throw error;
    }
  }, []);

  const fetchServerCart = useCallback(async () => {
    try {
      const data = await serverRequest('/api/cart');
      if (Array.isArray(data.items)) setCartItems(data.items);
      return data.items;
    } catch { return null; }
  }, [serverRequest]);

  const syncGuestCart = useCallback(async () => {
    if (syncPending.current) return syncPending.current;
    const items = loadGuestCart();
    if (!items.length) return;
    const pending = (async () => {
      const data = await serverRequest('/api/cart/sync', { method: 'POST', body: JSON.stringify({ items }) });
      if (!Array.isArray(data.items)) throw new Error('تعذر التحقق من مزامنة السلة. حاول مجددًا.');
      setCartItems(data.items);
      localStorage.removeItem(GUEST_CART_KEY);
      window.dispatchEvent(new Event('cart_change'));
    })();
    syncPending.current = pending;
    try { await pending; }
    finally { if (syncPending.current === pending) syncPending.current = null; }
  }, [loadGuestCart, serverRequest]);

  useEffect(() => {
    let active = true;
    async function refreshSession() {
      const logged = checkLogin();
      setIsLoggedIn(logged);
      try {
        if (logged) {
          await syncGuestCart();
          if (active && checkLogin()) await fetchServerCart();
        } else if (active) { setCartItems(loadGuestCart()); setWalletBalance(null); }
      } catch { /* serverRequest retains the actual error for the customer. */ }
      finally { if (active) setIsLoading(false); }
    }
    const onCartChange = () => { if (!checkLogin()) setCartItems(loadGuestCart()); };
    void refreshSession();
    window.addEventListener('user_session_change', refreshSession);
    window.addEventListener('cart_change', onCartChange);
    return () => {
      active = false;
      window.removeEventListener('user_session_change', refreshSession);
      window.removeEventListener('cart_change', onCartChange);
    };
  }, [checkLogin, syncGuestCart, fetchServerCart, loadGuestCart]);

  useEffect(() => {
    if (isCartOpen && checkLogin()) void fetchServerCart();
  }, [isCartOpen, checkLogin, fetchServerCart]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'id'>): Promise<boolean> => {
    if (checkLogin()) {
      await serverRequest('/api/cart', { method: 'POST', body: JSON.stringify(item) });
      await fetchServerCart();
      setIsCartOpen(true);
      return true;
    }
    const current = loadGuestCart();
    const target = (item.targetInput || '').trim();
    const custom = JSON.stringify(item.customFields || {});
    const existing = current.findIndex(entry => entry.serviceId === item.serviceId && (entry.targetInput || '') === target && JSON.stringify(entry.customFields || {}) === custom);
    const updated = [...current];
    if (existing >= 0) {
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + (item.quantity || 1), price: item.price };
    } else {
      updated.unshift({ ...item, id: 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36), quantity: item.quantity || 1, createdAt: new Date().toISOString() });
    }
    saveGuestCart(updated);
    setCartItems(updated);
    setCartError(null);
    setIsCartOpen(true);
    return true;
  }, [checkLogin, serverRequest, fetchServerCart, loadGuestCart, saveGuestCart]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (checkLogin()) {
      try {
        await serverRequest('/api/cart/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify({ quantity }) });
        await fetchServerCart();
      } catch { /* Do not replace a rejected server update with a guest edit. */ }
      return;
    }
    const items = quantity <= 0 ? loadGuestCart().filter(item => item.id !== id) : loadGuestCart().map(item => item.id === id ? { ...item, quantity } : item);
    saveGuestCart(items);
    setCartItems(items);
  }, [checkLogin, serverRequest, fetchServerCart, loadGuestCart, saveGuestCart]);

  const removeFromCart = useCallback(async (id: string) => {
    if (checkLogin()) {
      try {
        await serverRequest('/api/cart/' + encodeURIComponent(id), { method: 'DELETE' });
        await fetchServerCart();
      } catch { /* Preserve the last known server cart after an error. */ }
      return;
    }
    const items = loadGuestCart().filter(item => item.id !== id);
    saveGuestCart(items);
    setCartItems(items);
  }, [checkLogin, serverRequest, fetchServerCart, loadGuestCart, saveGuestCart]);

  const clearCart = useCallback(async () => {
    if (checkLogin()) {
      try { await serverRequest('/api/cart', { method: 'DELETE' }); }
      catch { return; }
    }
    localStorage.removeItem(GUEST_CART_KEY);
    setCartItems([]);
    setCartError(null);
    window.dispatchEvent(new Event('cart_change'));
  }, [checkLogin, serverRequest]);

  const checkout = useCallback(async () => {
    if (!checkLogin()) return { success: false, error: 'يرجى تسجيل الدخول لإتمام الشراء.' };
    try {
      // Failed additions in older versions were incorrectly kept as guest
      // items. Transfer them before placing an order, and stop on sync failure.
      await syncGuestCart();
      // Read the balance and quote from the same authenticated backend immediately
      // before debit; localStorage is only a cached profile, never wallet funds.
      const snapshot = await serverRequest('/api/cart');
      if (!Array.isArray(snapshot.items) || typeof snapshot.total !== 'number') throw new Error('تعذر التحقق من سعر السلة. أعد تحميل الصفحة.');
      setCartItems(snapshot.items);
      if (snapshot.items.some((item: CartItem) => item.quoteError)) throw new Error('إحدى الباقات غير متاحة أو غير مسعّرة. راجع السلة.');
      const displayedTotal = Number(cartItems.reduce((sum, item) => sum + (item.total ?? (item.price || 0) * (item.quantity || 1)), 0).toFixed(2));
      if (Math.abs(snapshot.total - displayedTotal) > 0.000001) return { success: false, error: 'تم تحديث أسعار أو محتويات السلة. راجع الإجمالي واضغط تأكيد الشراء مرة أخرى.' };
      const data = await serverRequest('/api/cart/checkout', { method: 'POST', body: JSON.stringify({ itemIds: snapshot.items.map((item: CartItem) => item.id), expectedTotal: snapshot.total }) });
      if (typeof data.newBalance === 'number') setWalletBalance(data.newBalance);
      setCartItems([]);
      try {
        const session = JSON.parse(localStorage.getItem('user_session') || 'null');
        if (session && typeof data.newBalance === 'number') localStorage.setItem('user_session', JSON.stringify({ ...session, balance: data.newBalance }));
      } catch { /* Checkout already committed; do not report a payment failure. */ }
      window.dispatchEvent(new Event('user_session_change'));
      return { success: true, message: data.message, orderIds: data.orderIds };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [checkLogin, syncGuestCart, serverRequest, cartItems]);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0), [cartItems]);
  const cartTotal = useMemo(() => Number(cartItems.reduce((sum, item) => sum + (item.total ?? (item.price || 0) * (item.quantity || 1)), 0).toFixed(2)), [cartItems]);
  return <CartContext.Provider value={{ cartItems, cartCount, cartTotal, cartError, walletBalance, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart, syncGuestCart, checkout, isLoading, isLoggedIn }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
