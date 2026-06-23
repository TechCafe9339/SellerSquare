"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Store,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Starts false (not null) since that's the safe SSR default. The effect
  // below corrects it on mount before paint, so there's no flash of the
  // wrong state for a logged-in user reloading the page.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Avoids SSR/hydration mismatch by reading localStorage only on mount
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("customer_token"));
    };

    checkAuth();

    // "storage" only fires for changes made in OTHER tabs — the browser
    // never fires it for writes made in the same tab that's reading it.
    // So logging in/out here, in this same tab, would never update the
    // navbar without a manual refresh. "auth-changed" is a custom event
    // we dispatch ourselves (see login/logout code) to cover that case.
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-changed", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  // Close the mobile menu automatically on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("customer_token");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors shrink-0"
        >
          <Store size={24} className="text-indigo-600" />
          <span className="font-bold text-xl tracking-tight">
            PrimeBasket
          </span>
        </Link>

        {/* Desktop links */}
        {/* <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div> */}

        {/* Right-side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:inline-flex p-2 rounded-full text-gray-600 hover:text-rose-500 hover:bg-gray-50 transition-colors"
          >
            <Heart size={20} />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="hidden sm:inline-flex p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
          >
            <ShoppingCart size={20} />
          </Link>

          {/* Before login: show Login / Signup. After login: show Profile / Logout only. */}
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                aria-label="Profile"
                className="hidden sm:inline-flex p-2 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
              >
                <User size={20} />
              </Link>

              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="hidden sm:inline-flex p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-100 my-2" />

            {/* Same rule on mobile: logged in -> Profile + Logout, logged out -> Login + Signup */}
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <User size={18} /> Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 text-center hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white text-center hover:bg-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}