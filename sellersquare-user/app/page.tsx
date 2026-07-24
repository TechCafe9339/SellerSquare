import { Hero } from "@/components/storefront/Hero";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { DealOfTheDay } from "@/components/storefront/DealOfTheDay";
import { ProductRail } from "@/components/storefront/ProductRail";
import { PromoGrid } from "@/components/storefront/PromoGrid";
import { getMockProducts } from "@/lib/data/products";
import { getProducts } from "@/lib/services/ProductService";

export default async function HomePage() {
  const dealProducts = getMockProducts(10, 0, "deal");
  const trendingProducts = getMockProducts(10, 3, "electronics");
  const recommendedProducts = getMockProducts(10, 7, "recommended");
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      {/* <CategoryNav /> */}
      <Hero />
      <CategoryTiles />
      <DealOfTheDay products={dealProducts} />
      <ProductRail
        title="Trending Products"
        products={products}
      />
      <PromoGrid />
      <ProductRail title="Picked for you" products={recommendedProducts} />
      <Footer />
    </main>
  );
}