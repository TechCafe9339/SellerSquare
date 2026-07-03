"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

interface CartItem {
  cart_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tracks which cart_ids are mid-flight for quantity changes or removal,
  // so we can disable just that row's controls instead of locking the
  // whole page while one request is in progress.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/cart/");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your cart. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const setPending = (cartId: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(cartId);
      else next.delete(cartId);
      return next;
    });
  };

  const removeItem = useCallback(async (cartId: string) => {
    setPending(cartId, true);
    // Optimistic: drop it immediately, restore it if the request fails.
    const removed = items.find((i) => i.cart_id === cartId);
    setItems((prev) => prev.filter((i) => i.cart_id !== cartId));

    try {
      await api.delete(`/cart/remove/${cartId}`);
    } catch (err) {
      console.error(err);
      if (removed) {
        setItems((prev) => [...prev, removed]);
      }
    } finally {
      setPending(cartId, false);
    }
  }, [items]);

  const changeQuantity = useCallback(
    async (cartId: string, nextQuantity: number) => {
      if (nextQuantity < 1 || pendingIds.has(cartId)) return;

      const previous = items.find((i) => i.cart_id === cartId)?.quantity;

      setPending(cartId, true);
      setItems((prev) =>
        prev.map((i) =>
          i.cart_id === cartId ? { ...i, quantity: nextQuantity } : i
        )
      );

      try {
        await api.put(`/cart/update/${cartId}`, { quantity: nextQuantity });
      } catch (err) {
        console.error(err);
        // Roll back to the last known-good quantity on failure.
        if (previous !== undefined) {
          setItems((prev) =>
            prev.map((i) =>
              i.cart_id === cartId ? { ...i, quantity: previous } : i
            )
          );
        }
      } finally {
        setPending(cartId, false);
      }
    },
    [items, pendingIds]
  );

  const handleCheckout = () => {
    setCheckingOut(true);
    router.push("/checkout");
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  // Flat placeholder shipping rule — replace with your real logic once
  // shipping cost is decided (flat rate, per-seller, weight-based, etc).
  const shipping = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-8">
          Shopping Cart
        </h1>
        <CartSkeleton />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-8">
        Shopping Cart
        {!error && items.length > 0 && (
          <span className="text-gray-400 font-normal text-lg ml-2">
            ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={fetchCart}
            className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-3 rounded-full bg-gray-100 text-gray-400 mb-4">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm">
            Add some products to continue shopping.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}

      {!error && items.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartRow
                key={item.cart_id}
                item={item}
                isPending={pendingIds.has(item.cart_id)}
                onIncrement={() =>
                  changeQuantity(item.cart_id, item.quantity + 1)
                }
                onDecrement={() =>
                  changeQuantity(item.cart_id, item.quantity - 1)
                }
                onRemove={() => removeItem(item.cart_id)}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span className="text-gray-900 font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "text-green-600 font-medium"
                        : "text-gray-900 font-medium"
                    }
                  >
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-baseline">
                <span className="font-semibold text-gray-900">
                  Total
                </span>
                <span className="font-bold text-2xl text-gray-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || pendingIds.size > 0}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
              >
                {checkingOut ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Taxes calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CartRow({
  item,
  isPending,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  isPending: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex gap-4">
      <Link
        href={`/product/${item.product_id}`}
        className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl bg-gray-50 overflow-hidden"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/product/${item.product_id}`}
            className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-indigo-600 transition-colors"
          >
            {item.name}
          </Link>

          <button
            onClick={onRemove}
            disabled={isPending}
            aria-label="Remove item"
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          ₹{item.price.toLocaleString("en-IN")} each
        </p>

        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="inline-flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={onDecrement}
              disabled={isPending || item.quantity <= 1}
              aria-label="Decrease quantity"
              className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-9 text-center text-sm font-medium text-gray-900 tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              disabled={isPending}
              aria-label="Increase quantity"
              className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          <p className="font-bold text-gray-900 text-lg">
            ₹{lineTotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4 animate-pulse"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-8 bg-gray-100 rounded w-1/2 mt-4" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-3">
        <div className="h-5 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-10 bg-gray-100 rounded w-full mt-4" />
      </div>
    </div>
  );
}