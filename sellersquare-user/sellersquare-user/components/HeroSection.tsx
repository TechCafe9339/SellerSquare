"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  href: string; // category page, e.g. "/products?category=electronics"
  // Leave image empty/undefined to show the gradient placeholder block.
  // Once you have real banner art, just set this to its path/URL —
  // nothing else in the component needs to change.
  image?: string;
  gradient: string; // tailwind gradient classes, used only when image is absent
}

// Swap href and image per slide. Title/subtitle are deliberately short —
// Flipkart banners lead with a deal headline, not a paragraph.
const SLIDES: HeroSlide[] = [
  {
    id: "electronics",
    title: "Top deals on Electronics",
    subtitle: "Up to 60% off · Phones, laptops & more",
    href: "/products?category=electronics",
    image: "/mobiles.jpg",
    gradient: "from-indigo-600 to-blue-500",
  },
  {
    id: "fashion",
    title: "Fashion that fits your style",
    subtitle: "New arrivals · Up to 50% off",
    href: "/products?category=fashion",
    image: "/fashion.jpg",
    gradient: "from-rose-500 to-orange-400",
  },
  {
    id: "home",
    title: "Refresh your home",
    subtitle: "Furniture & decor · Starting ₹499",
    href: "/products?category=home",
    image: "/furniture.jpg",
    gradient: "from-emerald-600 to-teal-500",
  },
  {
    id: "beauty",
    title: "Beauty & personal care",
    subtitle: "Top brands · Flat 30% off",
    href: "/products?category=beauty",
    image: "/beauty.jpg",
    gradient: "from-fuchsia-600 to-pink-500",
  },
];

const AUTO_ADVANCE_MS = 4000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance, paused on hover/focus so people can actually read a slide
  // before it changes out from under them.
  useEffect(() => {
    if (isPaused) return;

    timeoutRef.current = setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, isPaused, goNext]);

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/5] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {SLIDES.map((slide, i) => (
          <Link
            key={slide.id}
            href={slide.href}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${slide.gradient} flex items-center`}
              >
                <div className="px-6 sm:px-12 max-w-md">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <ImagePlus size={13} />
                    Placeholder — replace with your banner image
                  </p>
                  <h2 className="text-white text-2xl sm:text-4xl font-bold leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base mt-2">
                    {slide.subtitle}
                  </p>
                  <span className="inline-block mt-4 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg">
                    Shop now
                  </span>
                </div>
              </div>
            )}
          </Link>
        ))}

        {/* Manual arrows */}
        <button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            goPrev();
          }}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white text-gray-700 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            goNext();
          }}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white text-gray-700 transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}