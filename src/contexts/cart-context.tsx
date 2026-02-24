"use client";

import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Cart } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token || !user?.customerId) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      setCart(await api.getCart(token, user.customerId));
    } finally {
      setLoading(false);
    }
  }, [token, user?.customerId]);

  useEffect(() => {
    refreshCart().catch(() => undefined);
  }, [refreshCart]);

  const addItem = async (productId: number, quantity: number) => {
    if (!token || !user?.customerId) throw new Error("Login as customer required");
    setCart(await api.addToCart(token, user.customerId, productId, quantity));
  };

  const updateItem = async (itemId: number, quantity: number) => {
    if (!token || !user?.customerId) throw new Error("Login as customer required");
    setCart(await api.updateCartItem(token, user.customerId, itemId, quantity));
  };

  const removeItem = async (itemId: number) => {
    if (!token || !user?.customerId) throw new Error("Login as customer required");
    setCart(await api.removeCartItem(token, user.customerId, itemId));
  };

  const checkout = async () => {
    if (!token || !user?.customerId) throw new Error("Login as customer required");
    await api.checkout(token, user.customerId);
    await refreshCart();
  };

  const value = useMemo(
    () => ({ cart, loading, refreshCart, addItem, updateItem, removeItem, checkout }),
    [cart, loading, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
