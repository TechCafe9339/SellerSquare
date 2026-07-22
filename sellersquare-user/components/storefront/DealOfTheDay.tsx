"use client";
import { Flame } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { DealCountdown } from "./DealCountDown";

export function DealOfTheDay({ products }: { products: Product[] }) {
  return (
    <section className="px-5 pt-11 md:px-7">
      <div className="mx-auto max-w-[1320px] rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Flame size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Deal of the Day</h2>
              <p className="text-xs text-gray-500">Prices this good disappear at midnight</p>
            </div>
          </div>
          <DealCountdown />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}