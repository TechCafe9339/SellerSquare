import HeroSection from "@/components/HeroSection";
import CategorySection from "./CategorySection";
import FeaturedProducts from "./FeaturedProducts";
import Footer from "./Footer";
import { Suspense } from "react";

export default function CustomerHomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <CategorySection />
      </Suspense>
      <HeroSection />
      <FeaturedProducts />
      <Footer />
    </>
  );
}