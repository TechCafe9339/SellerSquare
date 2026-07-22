import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { getMockProducts } from "@/lib/data/products";
import { matchesFilters, parseSelected } from "@/lib/filters";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryFilters } from "@/components/storefront/CategoryFilters";

const routableSlugs = categories.map((c) => c.slug).filter((s) => s !== "for-you");

export function generateStaticParams() {
  return routableSlugs.map((category) => ({ category }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ price?: string; rating?: string }>;
}) {
  const { category } = await params;
  const { price, rating } = await searchParams;

  const meta = categories.find((c) => c.slug === category);
  if (!meta) notFound();

  const selectedPrices = parseSelected(price);
  const selectedRatings = parseSelected(rating);

  // TODO: once this hits a real backend, pass price/rating as query params to the
  // API instead of filtering an already-fetched array — filtering server-side in
  // the database scales; filtering a fixed array of 24 mock items doesn't need to.
  const allProducts = getMockProducts(24, 0, category);
  const products = allProducts.filter((p) => matchesFilters(p, selectedPrices, selectedRatings));

  return (
    <main className="mx-auto min-h-screen max-w-[1320px] px-5 py-8 md:px-7">
      <nav className="mb-5 text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-gray-900">{meta.label}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">{meta.label}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          {/* useSearchParams inside CategoryFilters requires a Suspense boundary */}
          <Suspense fallback={<div className="h-64 rounded-xl border border-gray-200" />}>
            <CategoryFilters />
          </Suspense>
        </aside>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
            <p className="mb-1 text-lg font-semibold text-gray-900">
              No products match these filters
            </p>
            <p className="text-sm text-gray-500">Try removing a filter to see more results.</p>
          </div>
        )}
      </div>
    </main>
  );
}