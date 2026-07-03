"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Shirt,
  Smartphone,
  Sparkles,
  Laptop,
  Lamp,
  PackageOpen,
  Plug,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// "For You" has no category filter (it's the default/home view) — every
// other tab links to /products?category=X, matching the rest of the app.
const categories = [
  { name: "For You", icon: ShoppingBag, href: "/products" },
  { name: "Fashion", icon: Shirt, href: "/products?category=Fashion" },
  { name: "Mobiles", icon: Smartphone, href: "/products?category=Mobiles" },
  { name: "Beauty", icon: Sparkles, href: "/products?category=Beauty" },
  { name: "Electronics", icon: Laptop, href: "/products?category=Electronics" },
  { name: "Home", icon: Lamp, href: "/products?category=Home" },
  { name: "Appliances", icon: Plug, href: "/products?category=Appliances" },
  { name: "Toys & Baby", icon: PackageOpen, href: "/products?category=Toys" },
  { name: "Sports", icon: Gamepad2, href: "/products?category=Sports" },
];

export default function CategorySection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  const isActive = (tab: (typeof categories)[number]) => {
    if (tab.name === "For You") {
      // "For You" is active only when no category filter is applied at all.
      return pathname === "/products" && !activeCategory;
    }
    const tabCategory = new URL(tab.href, "http://x").searchParams.get("category");
    return activeCategory === tabCategory;
  };

  return (
    <nav className="relative w-full bg-white border-b border-gray-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 group/row">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll categories left"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Flat tab-bar layout, not a card grid: small line icons, plain
            text, and an underline on whichever tab matches the current
            category — same visual language as Flipkart's top nav strip. */}
        <div
          ref={scrollRef}
          className="flex gap-7 sm:gap-9 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const active = isActive(category);

            return (
              <Link
                key={category.name}
                href={category.href}
                className="group flex flex-col items-center shrink-0 snap-start pt-3 pb-2.5"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>

                <span
                  className={`mt-1 text-xs sm:text-[13px] whitespace-nowrap transition-colors ${
                    active
                      ? "font-semibold text-gray-900"
                      : "font-medium text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {category.name}
                </span>

                {/* Underline: only rendered for the active tab, present (and
                    transparent) for the rest so the row height never jumps. */}
                <span
                  className={`mt-1.5 h-[3px] w-8 rounded-full ${
                    active ? "bg-blue-600" : "bg-transparent"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll categories right"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-gray-900 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}