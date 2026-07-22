"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface CartWishlistContextValue {
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  refreshCounts: () => Promise<void>;
}

const CartWishlistContext = createContext<CartWishlistContextValue | null>(null);

export function CartWishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshCounts = useCallback(async () => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    try {
      const cartRes = await api.get("/cart/");
      const cartItems = Array.isArray(cartRes.data) ? cartRes.data : [];
      setCartCount(cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
    } catch (err) {
      console.error("Failed to load cart count", err);
    }

    try {
      // TODO: confirm this matches your real wishlist GET endpoint —
      // assumed to mirror /cart/'s shape (an array of items) since it wasn't shown yet.
      const wishlistRes = await api.get("/wishlist/");
      const wishlistItems = Array.isArray(wishlistRes.data) ? wishlistRes.data : [];
      setWishlistCount(wishlistItems.length);
    } catch (err) {
      console.error("Failed to load wishlist count", err);
    }
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const requireAuth = useCallback(
    (message: string) => {
      const token = localStorage.getItem("customer_token");
      if (!token) {
        toast.error(message);
        router.push("/login");
        return false;
      }
      return true;
    },
    [router]
  );

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!requireAuth("Please login to add items to cart")) return;

      try {
        await api.post("/cart/add", { product_id: productId, quantity });
        toast.success("Added to cart");
        await refreshCounts();
      } catch (err) {
        console.error(err);
        toast.error("Couldn't add this item — it may not be available yet");
      }
    },
    [requireAuth, refreshCounts]
  );

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!requireAuth("Please login to use wishlist")) return;

      try {
        await api.post("/wishlist/add", { product_id: productId });
        toast.success("Added to wishlist");
        await refreshCounts();
      } catch (err) {
        console.error(err);
        toast.error("Couldn't add this item — it may not be available yet");
      }
    },
    [requireAuth, refreshCounts]
  );

  return (
    <CartWishlistContext.Provider
      value={{ cartCount, wishlistCount, addToCart, addToWishlist, refreshCounts }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  const ctx = useContext(CartWishlistContext);
  if (!ctx) {
    throw new Error("useCartWishlist must be used within a CartWishlistProvider");
  }
  return ctx;
}