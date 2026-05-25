"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, Product } from "../data/mockData";
import { createClient } from "@/utils/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  user: User | null;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());

  const addToCart = (product: Product, size: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, size }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity: qty } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // Keep UI auth state in sync with Supabase session.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const userId = sessionUser.id;
      const [{ data: profile }, { data: adminRow }] = await Promise.all([
        supabase.from("profiles").select("username").eq("id", userId).maybeSingle(),
        supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle(),
      ]);

      if (cancelled) return;

      const email = sessionUser.email ?? "";
      const name =
        profile?.username ||
        (typeof sessionUser.user_metadata?.username === "string" ? sessionUser.user_metadata.username : "") ||
        (email.includes("@") ? email.split("@")[0] : "ลูกค้า");
      setUser({
        id: sessionUser.id,
        name,
        email,
        role: adminRow ? "admin" : "customer",
      });
    };

    hydrate();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      hydrate();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, user, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
