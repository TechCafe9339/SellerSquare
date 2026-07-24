"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ImageIcon, Loader2 } from "lucide-react";
import { Product, discountPercent } from "@/lib/types";
import { useCartWishlist } from "@/lib/context/CartWishListContext";

const DISCOUNT_BADGE_THRESHOLD = 15;

export function ProductCard({
  product,
  variant = "rail",
}: {
  product: Product;
  variant?: "rail" | "grid";
}) {
  const { addToCart, addToWishlist } = useCartWishlist();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [cartPending, setCartPending] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const off = discountPercent(product);

  const handleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Optimistic toggle so the icon feels instant.
      const next = !wishlisted;
      setWishlisted(next);
      setWishlistPending(true);

      try {
        await addToWishlist(product.id);
      } catch {
        // Roll back on failure so the UI never lies about state.
        setWishlisted(!next);
      } finally {
        setWishlistPending(false);
      }
    },
    [wishlisted, addToWishlist, product.id]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setCartPending(true);
      try {
        await addToCart(product.id, 1);
      } finally {
        setCartPending(false);
      }
    },
    [addToCart, product.id]
  );

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-transparent hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
        variant === "rail" ? "w-[210px] flex-shrink-0" : "w-full"
      }`}
    >
      <div className="relative h-[150px] overflow-hidden bg-gray-100">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageIcon size={32} strokeWidth={1.5} aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 45vw, 210px"
            className="object-contain p-3"
            onError={() => setImageFailed(true)}
          />
        )}

        {off >= DISCOUNT_BADGE_THRESHOLD && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
            {off}% OFF
          </span>
        )}

        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={handleWishlist}
          disabled={wishlistPending}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 transition hover:scale-110 hover:text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
        >
          <Heart
            size={13}
            className={wishlisted ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>
      </div>

      <div className="p-3.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-400">
          {product.brand}
        </div>

        <div className="mb-1.5 mt-0.5 line-clamp-2 h-[34px] text-[13px] font-semibold leading-snug">
          {product.name}
        </div>

        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
            {product.rating} ★
          </span>
          <span className="text-[11px] text-gray-400">
            ({product.reviews.toLocaleString("en-IN")})
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-base font-bold">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-400 line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold text-green-600">
            {off}% off
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={cartPending}
          aria-busy={cartPending}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-indigo-600 py-2 text-xs font-semibold text-indigo-600 opacity-100 transition hover:bg-indigo-600 hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-70 md:opacity-0 md:group-hover:opacity-100"
        >
          {cartPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </Link>
  );
}