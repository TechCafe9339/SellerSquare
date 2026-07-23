"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Manrope, Fraunces } from "next/font/google";
import { Heart, LogOut, Search, ShoppingBasket, ShoppingCart, UserRound } from "lucide-react";
import { useCartWishlist } from "@/lib/context/CartWishListContext";
import { useAuth } from "@/lib/context/AuthContext";

// Same pairing used on auth pages, kept local so the header carries its own
// brand voice wherever it's dropped in.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const SEARCH_CATEGORIES = ["All", "Fashion", "Mobiles", "Electronics", "Home"];

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#E2A93D] px-1 text-[10px] font-bold text-[#123524]">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const { cartCount, wishlistCount } = useCartWishlist();
  const { isLoggedIn, logout, loading } = useAuth();
  const router = useRouter();
  if (loading) {
    return null; // or a loading placeholder
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`${display.variable} ${body.variable} sticky top-0 z-50 border-b border-[#DEE6DB] bg-white font-[var(--font-body)]`}
    >
      <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-3.5 md:px-7">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 text-[#471cc9]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[#E2A93D]">
            <ShoppingBasket size={17} />
          </span>
          <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight">
            PrimeBasket
          </span>
        </Link>

        {/* Search */}
        <form
          role="search"
          className="flex max-w-[680px] flex-1 overflow-hidden rounded-xl border border-[#DEE6DB] bg-white transition focus-within:border-[#123524] focus-within:ring-4 focus-within:ring-[#123524]/10"
        >
          <select
            aria-label="Search category"
            className="hidden max-w-[130px] border-r border-[#DEE6DB] bg-[#F5F7F3] px-3 text-sm text-[#5B6B5F] sm:block"
          >
            {SEARCH_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search for products, brands and more…"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[#16201A] outline-none placeholder:text-[#8A968D]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center justify-center bg-[#471cc9] px-5 text-white transition hover:bg-[#471cc9]"
          >
            <Search size={17} />
          </button>
        </form>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Link
            href="/wishlist"
            className="relative hidden flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#5B6B5F] transition hover:bg-[#EFF3EC] hover:text-[#123524] sm:flex"
          >
            <Heart size={19} />
            Wishlist
            <CountBadge count={wishlistCount} />
          </Link>

          <Link
            href="/cart"
            className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#5B6B5F] transition hover:bg-[#EFF3EC] hover:text-[#123524]"
          >
            <ShoppingCart size={19} />
            Cart
            <CountBadge count={cartCount} />
          </Link>

          <div className="ml-2 flex items-center gap-2 border-l border-[#DEE6DB] pl-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 rounded-lg border border-[#DEE6DB] px-3.5 py-2 text-sm font-semibold text-[#16201A] transition hover:border-[#123524] hover:text-[#123524]"
                >
                  <UserRound size={16} />
                  My account
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#8A968D] transition hover:bg-[#FBEDEC] hover:text-[#B3261E]"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#16201A] transition hover:text-[#123524]"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#471cc9] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#471cc9]"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}