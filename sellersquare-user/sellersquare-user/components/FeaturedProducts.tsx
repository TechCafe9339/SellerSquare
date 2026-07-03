"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  ratingCount?: number;
  inWishlist?: boolean;
  inCart?: boolean;
}

// Shared width classes for the card + skeleton so they can never drift
// out of sync with each other.
const CARD_WIDTH_CLASSES = "w-[42vw] xs:w-[160px] sm:w-[220px] max-w-[220px]";

export default function FeaturedProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Same pending-click guard pattern as the main products page: tracks
  // which product ids are mid-flight so a double-click can't fire two
  // requests, without locking the whole grid while one card is busy.
  const [pendingCart, setPendingCart] = useState<Set<string>>(new Set());
  const [pendingWishlist, setPendingWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/customer/all");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list.slice(0, 8));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Cart -----------------------------------------------------------

  const toggleCart = useCallback(
    async (product: Product) => {
      const token = localStorage.getItem("customer_token");

      if (!token) {
        toast.error("Please login to add items to cart");
        router.push("/login");
        return;
      }

      if (pendingCart.has(product.id)) return;

      const goingIntoCart = !product.inCart;

      setPendingCart((prev) => new Set(prev).add(product.id));

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, inCart: goingIntoCart }
            : p
        )
      );

      try {
        if (goingIntoCart) {
          await api.post("/cart/add", {
            product_id: product.id,
            quantity: 1,
          });
        } else {
          await api.post("/cart/remove", {
            product_id: product.id,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong, please try again");

        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, inCart: !goingIntoCart }
              : p
          )
        );
      } finally {
        setPendingCart((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }
    },
    [pendingCart, router]
  );

  // --- Wishlist ---------------------------------------------------------

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const token = localStorage.getItem("customer_token");

      if (!token) {
        toast.error("Please login to use wishlist");
        router.push("/login");
        return;
      }

      if (pendingWishlist.has(product.id)) return;

      const goingIntoWishlist = !product.inWishlist;

      setPendingWishlist((prev) =>
        new Set(prev).add(product.id)
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
              ...p,
              inWishlist: goingIntoWishlist,
            }
            : p
        )
      );

      try {
        if (goingIntoWishlist) {
          await api.post("/wishlist/add", {
            product_id: product.id,
          });
        } else {
          await api.post("/wishlist/remove", {
            product_id: product.id,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong, please try again");

        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? {
                ...p,
                inWishlist: !goingIntoWishlist,
              }
              : p
          )
        );
      } finally {
        setPendingWishlist((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }
    },
    [pendingWishlist, router]
  );

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Featured Products</h2>
        </div>
        <FeaturedProductsSkeleton />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Featured Products</h2>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            aria-label="Refresh products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-60 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <Link
            href="/products"
            className="text-indigo-600 font-medium hover:underline text-sm sm:text-base"
          >
            View All
          </Link>
        </div>
      </div>

      <ScrollRow>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isCartPending={pendingCart.has(product.id)}
            isWishlistPending={pendingWishlist.has(product.id)}
            onToggleCart={() => toggleCart(product)}
            onToggleWishlist={() => toggleWishlist(product)}
          />
        ))}
      </ScrollRow>
    </section>
  );
}

// Flipkart-style horizontal product row: cards stay a fixed width no
// matter how many there are (2 products look the same size as 20 — no
// stretching to fill a grid column), the row scrolls instead of wrapping,
// and arrow buttons appear once there's enough content to make them useful.
//
// On touch devices there's no hover, so arrows are hidden below `sm` and
// native swipe/snap scrolling takes over instead.
function ScrollRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 transition-opacity"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

function ProductCard({
  product,
  isCartPending,
  isWishlistPending,
  onToggleCart,
  onToggleWishlist,
}: {
  product: Product;
  isCartPending: boolean;
  isWishlistPending: boolean;
  onToggleCart: () => void;
  onToggleWishlist: () => void;
}) {
  // Dummy rating: deterministic per product id so it doesn't reshuffle on
  // every re-render, but clearly marked so it's swapped for the real field
  // the moment your API returns one. Hashing the id keeps it stable
  // without needing any extra state.
  const dummyRating = product.rating ?? getDummyRating(product.id);
  const dummyRatingCount = product.ratingCount ?? getDummyRatingCount(product.id);

  return (
    <div
      className={`group relative ${CARD_WIDTH_CLASSES} shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col`}
    >
      <button
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleWishlist();
        }}
        disabled={isWishlistPending}
        aria-label={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={!!product.inWishlist}
        className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors disabled:opacity-60"
      >
        <Heart
          size={16}
          className={
            (product.inWishlist ? "fill-rose-500 text-rose-500" : "text-gray-400") +
            " sm:w-[17px] sm:h-[17px]"
          }
        />
      </button>

      <Link href={`/products/${product.id}`} className="contents">
        <div className="relative w-full aspect-square bg-gray-50 p-3 sm:p-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 42vw, 220px"
            className="object-contain group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="p-3 sm:p-4 flex-1">
          <p className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wide truncate">
            {product.category}
          </p>
          <h3 className="font-medium text-gray-900 mt-1 text-sm sm:text-base line-clamp-2">
            {product.name}
          </h3>

          {/* Dummy rating — replace once /customer/all returns real rating/ratingCount */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
              {dummyRating.toFixed(1)}
              <Star size={11} className="fill-white" />
            </span>
            <span className="text-xs text-gray-400">
              {formatRatingCount(dummyRatingCount)}
            </span>
          </div>

          <p className="text-base sm:text-xl font-bold text-gray-900 mt-2 sm:mt-2.5">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
        </div>
      </Link>

      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleCart();
          }}
          disabled={isCartPending}
          className={
            "w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors disabled:cursor-not-allowed " +
            (product.inCart
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-slate-900 text-white hover:bg-slate-800")
          }
        >
          {product.inCart ? (
            <>
              <Check size={15} className="sm:w-4 sm:h-4" />
              In cart
            </>
          ) : (
            <>
              <ShoppingCart size={15} className="sm:w-4 sm:h-4" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Dummy rating helpers -------------------------------------------------
// Deterministic from the product id (simple string hash) so a given card
// shows the same rating on every render instead of jumping around randomly.
// Delete these the moment the API supplies real rating/ratingCount.

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDummyRating(id: string): number {
  const hash = hashString(id);
  // Lands between 3.5 and 5.0 — dummy ratings should look plausible, not random/bad.
  return 3.5 + (hash % 16) / 10;
}

function getDummyRatingCount(id: string): number {
  const hash = hashString(id + "count");
  return 20 + (hash % 4980);
}

function formatRatingCount(count: number): string {
  if (count >= 100000) return `${(count / 100000).toFixed(1)}L ratings`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K ratings`;
  return `${count} rating${count !== 1 ? "s" : ""}`;
}

function FeaturedProductsSkeleton() {
  return (
    <div className="flex gap-3 sm:gap-5 overflow-x-hidden pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`${CARD_WIDTH_CLASSES} shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse`}
        >
          <div className="w-full aspect-square bg-gray-100" />
          <div className="p-3 sm:p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-6 bg-gray-100 rounded w-1/4 mt-1" />
            <div className="h-9 bg-gray-100 rounded w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}