"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductRail({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  return (
    <section className="px-5 pt-3 md:px-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <Link href={viewAllHref} className="text-sm font-semibold text-indigo-600">
                View all →
              </Link>
            )}
            <div className="flex gap-2">
              <button
                aria-label="Scroll left"
                onClick={() => scroll(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                aria-label="Scroll right"
                onClick={() => scroll(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}