import Link from "next/link";
import { Package } from "lucide-react";
import { categoryTiles } from "@/lib/data/categories";

export function CategoryTiles() {
  return (
    <section className="px-5 pt-11 md:px-7">
      <div className="mx-auto mb-5 flex max-w-[1320px] items-baseline justify-between">
        <h2 className="text-xl font-bold md:text-2xl">Shop by category</h2>
        {/* later we impleme a full category page with all categories and a search bar, for now we just show the top 8 categories */}
        {/* <Link href="/categories" className="text-sm font-semibold text-indigo-600">
          View all →
        </Link> */}
      </div>
      <div className="mx-auto grid max-w-[1320px] grid-cols-3 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
        {categoryTiles.map((tile) => (
          <Link
            key={tile.slug}
            href={`/${tile.slug}`}
            className="flex flex-col items-center gap-2.5 rounded-2xl px-2 py-4 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${tile.from} ${tile.to} text-white`}
            >
              <Package size={22} />
            </span>
            <span className="text-xs font-semibold text-gray-500">{tile.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}