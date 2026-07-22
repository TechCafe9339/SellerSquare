"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ImageIcon } from "lucide-react";
import { Product, discountPercent } from "@/lib/types";
import { useCartWishlist } from "@/lib/context/CartWishListContext";

export function ProductCard({
  product,
  variant = "rail",
}: {
  product: Product;
  variant?: "rail" | "grid";
}) {
  const { addToCart, addToWishlist } = useCartWishlist();
  const [wishlisted, setWishlisted] = useState(false);
  const off = discountPercent(product);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault(); // stop the surrounding <Link> from navigating
    setWishlisted((prev) => !prev); // optimistic icon fill, independent of the API result
    addToWishlist(product.id);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart(product.id, 1);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-transparent hover:shadow-lg ${
        variant === "rail" ? "w-[210px] flex-shrink-0" : "w-full"
      }`}
    >
      <div
        className={`relative flex h-[150px] items-center justify-center bg-gradient-to-br ${product.gradientFrom} ${product.gradientTo} text-white/85`}
      >
        {off >= 15 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
            {off}% OFF
          </span>
        )}
        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 transition hover:scale-110 hover:text-rose-600"
        >
          <Heart size={13} className={wishlisted ? "fill-rose-500 text-rose-500" : ""} />
        </button>
        <ImageIcon size={40} strokeWidth={1.4} />
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
          <span className="text-xs font-semibold text-green-600">{off}% off</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-2.5 w-full rounded-lg border-[1.5px] border-indigo-600 py-2 text-xs font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100 hover:bg-indigo-600 hover:text-white"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}