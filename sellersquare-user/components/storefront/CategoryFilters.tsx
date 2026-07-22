"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRICE_BANDS, RATING_BANDS, parseSelected } from "@/lib/filters";

export function CategoryFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedPrices = parseSelected(searchParams.get("price") ?? undefined);
  const selectedRatings = parseSelected(searchParams.get("rating") ?? undefined);
  const hasActiveFilters = selectedPrices.length > 0 || selectedRatings.length > 0;

  function toggle(key: "price" | "rating", value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Price</h4>
        {PRICE_BANDS.map((band) => (
          <label key={band.value} className="flex items-center gap-2 py-1 text-sm text-gray-600">
            <input
              type="checkbox"
              className="accent-indigo-600"
              checked={selectedPrices.includes(band.value)}
              onChange={() => toggle("price", band.value, selectedPrices)}
            />
            {band.label}
          </label>
        ))}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Rating</h4>
        {RATING_BANDS.map((band) => (
          <label key={band.value} className="flex items-center gap-2 py-1 text-sm text-gray-600">
            <input
              type="checkbox"
              className="accent-indigo-600"
              checked={selectedRatings.includes(band.value)}
              onChange={() => toggle("rating", band.value, selectedRatings)}
            />
            {band.label}
          </label>
        ))}
      </div>
    </div>
  );
}