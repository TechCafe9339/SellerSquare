"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, Package } from "lucide-react";
import { useCartWishlist } from "@/lib/context/CartWishListContext";

export function Header() {
  const { cartCount, wishlistCount } = useCartWishlist();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1320px] items-center gap-7 px-5 py-3.5 md:px-7">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2 text-xl font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 text-white">
            <Package size={17} />
          </span>
          PrimeBasket
        </Link>

        <form
          role="search"
          className="flex max-w-[680px] flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white transition focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100"
        >
          <select
            aria-label="Search category"
            className="hidden max-w-[130px] border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 sm:block"
          >
            <option>All</option>
            <option>Fashion</option>
            <option>Mobiles</option>
            <option>Electronics</option>
            <option>Home</option>
          </select>
          <input
            type="text"
            placeholder="Search for products, brands and more…"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center bg-indigo-600 px-5 text-white transition hover:bg-indigo-800"
          >
            <Search size={17} />
          </button>
        </form>

        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href="/wishlist"
            className="relative hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600 sm:flex"
          >
            <Heart size={19} />
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9.5px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <ShoppingCart size={19} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-0.5 right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9.5px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="ml-1 hidden rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:border-indigo-600 hover:text-indigo-600 sm:block"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-indigo-700 hover:shadow-md"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}