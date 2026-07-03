import { Header } from "@/components/storefront/Header";
import { CategoryNav } from "@/components/storefront/CategoryNav";
import { Hero } from "@/components/storefront/Hero";
import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { DealOfTheDay } from "@/components/storefront/DealOfTheDay";
import { ProductRail } from "@/components/storefront/ProductRail";
import { PromoGrid } from "@/components/storefront/PromoGrid";
import { Footer } from "@/components/storefront/Footer";
import { getMockProducts } from "@/lib/data/products";

// This is a Server Component — data fetching happens here, on the server,
// with no client-side loading spinner needed for the initial page load.
export default async function HomePage() {
  // TODO: swap these three calls for real backend fetches, e.g.:
  // const dealProducts = await getProducts({ tag: "deal-of-the-day", limit: 10 });
  const dealProducts = getMockProducts(10, 0, "deal");
  const trendingProducts = getMockProducts(10, 3, "electronics");
  const recommendedProducts = getMockProducts(10, 7, "recommended");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-950 py-1.5 text-center text-[12.5px] text-indigo-100">
        Free delivery on orders above <strong className="text-white">₹499</strong> &nbsp;·&nbsp; Easy 7-day
        returns &nbsp;·&nbsp; <strong className="text-white">New here?</strong> Get 10% off your first order
      </div>

      <Header />
      <CategoryNav />

      <main>
        <Hero />
        <CategoryTiles />
        <DealOfTheDay products={dealProducts} />
        <ProductRail title="Trending in Electronics" products={trendingProducts} viewAllHref="/electronics" />
        <PromoGrid />
        <ProductRail title="Picked for you" products={recommendedProducts} />
      </main>

      <Footer />
    </div>
  );
}