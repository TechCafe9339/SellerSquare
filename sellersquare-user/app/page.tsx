import { Hero } from "@/components/storefront/Hero";
import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { DealOfTheDay } from "@/components/storefront/DealOfTheDay";
import { ProductRail } from "@/components/storefront/ProductRail";
import { PromoGrid } from "@/components/storefront/PromoGrid";
import { getMockProducts } from "@/lib/data/products";

export default async function HomePage() {
  const dealProducts = getMockProducts(10, 0, "deal");
  const trendingProducts = getMockProducts(10, 3, "electronics");
  const recommendedProducts = getMockProducts(10, 7, "recommended");

  return (
    <main className="min-h-screen bg-gray-50">
      <Hero />
      <CategoryTiles />
      <DealOfTheDay products={dealProducts} />
      <ProductRail title="Trending in Electronics" products={trendingProducts} viewAllHref="/electronics" />
      <PromoGrid />
      <ProductRail title="Picked for you" products={recommendedProducts} />
    </main>
  );
}