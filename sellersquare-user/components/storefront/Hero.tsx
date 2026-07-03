import { ChevronLeft, ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section className="px-5 pt-5 md:px-7">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-4 lg:grid-cols-[2.1fr_1fr]">
        <div className="relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#241F5E] via-indigo-600 to-indigo-400 p-8 text-white md:min-h-[400px] md:p-12">
          <button
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="relative z-10 max-w-[420px]">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              Monsoon Sale · Live now
            </span>
            <h1 className="mb-3.5 text-3xl font-bold leading-tight md:text-[38px]">
              Up to 60% off electronics &amp; fashion
            </h1>
            <p className="mb-6 text-[15px] leading-relaxed text-white/80">
              Top brands, deep discounts, and delivery as fast as tomorrow.
            </p>
            <button className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-800 shadow-lg">
              Shop the sale
            </button>
          </div>

          <button
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-5 left-8 z-10 flex gap-1.5">
            <span className="h-1.5 w-5 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>

          <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-white/10 blur-xl" />
        </div>

        <div className="flex flex-row gap-4 lg:flex-col">
          <div className="flex flex-1 flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-600 p-6 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-85">New Arrivals</span>
            <h3 className="mt-2 mb-1 text-lg font-bold">Autumn Tech Edit</h3>
            <p className="text-xs opacity-85">Laptops, tablets &amp; wearables</p>
          </div>
          <div className="flex flex-1 flex-col justify-center rounded-3xl bg-gradient-to-br from-amber-700 to-amber-500 p-6 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-85">Ending Soon</span>
            <h3 className="mt-2 mb-1 text-lg font-bold">Beauty Bonanza</h3>
            <p className="text-xs opacity-85">Buy 2 Get 1 free, sitewide</p>
          </div>
        </div>
      </div>
    </section>
  );
}