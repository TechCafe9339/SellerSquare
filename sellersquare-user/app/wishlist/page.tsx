"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, Loader2, Heart, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface WishlistItem {
  wishlist_id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
}

export default function WishlistPage() {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tracks which wishlist_ids are mid-flight (removing, or moving to cart)
  // so we can disable just that row instead of the whole page, and so a
  // double-click can't fire the same request twice.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  // Per-row error message, e.g. "added to cart but wishlist app removal failed".
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/wishlist/");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your wishlist. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const setPending = (id: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearRowError = (id: string) => {
    setRowErrors((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const removeWishlist = useCallback(async (wishlistId: string) => {
    if (pendingIds.has(wishlistId)) return;

    setPending(wishlistId, true);
    clearRowError(wishlistId);

    try {
      await api.delete(`/wishlist/remove/${wishlistId}`);
      setItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
    } catch (err) {
      console.error(err);
      setRowErrors((prev) => ({
        ...prev,
        [wishlistId]: "Couldn't remove this item. Try again.",
      }));
    } finally {
      setPending(wishlistId, false);
    }
  }, [pendingIds]);

  const addToCart = useCallback(
    async (productId: string, wishlistId: string) => {
      if (pendingIds.has(wishlistId)) return;

      setPending(wishlistId, true);
      clearRowError(wishlistId);

      try {
        await api.post("/cart/add", { product_id: productId, quantity: 1 });
      } catch (err) {
        console.error(err);
        setPending(wishlistId, false);
        setRowErrors((prev) => ({
          ...prev,
          [wishlistId]: "Couldn't add this to your cart. Try again.",
        }));
        return;
      }

      try {
        await api.delete(`/wishlist/remove/${wishlistId}`);
        setItems((prev) => prev.filter((item) => item.wishlist_id !== wishlistId));
      } catch (err) {
        // The item is genuinely in the cart now — this failure is only
        // about wishlist cleanup, so say exactly that rather than implying
        // the add-to-cart itself didn't work.
        console.error(err);
        setRowErrors((prev) => ({
          ...prev,
          [wishlistId]: "Added to cart, but couldn't remove it from your wishlist.",
        }));
      } finally {
        setPending(wishlistId, false);
      }
    },
    [pendingIds]
  );

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-8">
          My Wishlist
        </h1>
        <WishlistSkeleton />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-8">
        My Wishlist
        {!error && items.length > 0 && (
          <span className="text-gray-400 font-normal text-lg ml-2">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={fetchWishlist}
            className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="inline-flex p-3 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Heart size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm">
            Save items you like so you can find them later.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Browse Products
          </button>
        </div>
      )}

      {!error && items.length > 0 && (
        <div className="grid gap-4">
          {items.map((item) => (
            <WishlistRow
              key={item.wishlist_id}
              item={item}
              isPending={pendingIds.has(item.wishlist_id)}
              errorMessage={rowErrors[item.wishlist_id]}
              onAddToCart={() => addToCart(item.product_id, item.wishlist_id)}
              onRemove={() => removeWishlist(item.wishlist_id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WishlistRow({
  item,
  isPending,
  errorMessage,
  onAddToCart,
  onRemove,
}: {
  item: WishlistItem;
  isPending: boolean;
  errorMessage?: string;
  onAddToCart: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <Link
        href={`/product/${item.product_id}`}
        className="relative w-24 h-24 shrink-0 rounded-xl bg-gray-50 overflow-hidden mx-auto sm:mx-0"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-2"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.product_id}`}
          className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors"
        >
          {item.name}
        </Link>

        <p className="text-green-600 font-bold mt-1">
          ₹{item.price.toLocaleString("en-IN")}
        </p>

        {errorMessage && (
          <p className="text-xs text-red-600 mt-1.5">{errorMessage}</p>
        )}
      </div>

      <div className="flex gap-2.5 shrink-0">
        <button
          onClick={onAddToCart}
          disabled={isPending}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {isPending ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <ShoppingCart size={17} />
          )}
          Add to cart
        </button>

        <button
          onClick={onRemove}
          disabled={isPending}
          aria-label="Remove from wishlist"
          className="flex items-center justify-center p-2.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors border border-red-100"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 animate-pulse"
        >
          <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
          <div className="hidden sm:flex gap-2.5">
            <div className="h-10 w-32 bg-gray-100 rounded-lg" />
            <div className="h-10 w-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}