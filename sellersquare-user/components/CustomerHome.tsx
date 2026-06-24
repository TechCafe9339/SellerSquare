import HeroSection from "@/components/HeroSection";
import CategorySection from "./CategorySection";
import FeaturedProducts from "./FeaturedProducts";
import { Suspense } from "react";

export default function CustomerHomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <CategorySection />
      </Suspense>
      <HeroSection />
      <FeaturedProducts />
    </>
  );
}