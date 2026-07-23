import Link from "next/link";
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const STATS = [
  { value: "12,000+", label: "Active sellers" },
  { value: "₹450 Cr+", label: "GMV processed" },
  { value: "98.6%", label: "On-time fulfillment" },
];

const FEATURES = [
  {
    icon: Package,
    title: "Effortless catalog management",
    description:
      "List, edit, and organize your products in bulk. Update pricing and stock across every channel from a single screen.",
  },
  {
    icon: ShoppingBag,
    title: "End-to-end order tracking",
    description:
      "Follow every order from confirmation to delivery, with automated status updates for you and your customers.",
  },
  {
    icon: TrendingUp,
    title: "Revenue insights that matter",
    description:
      "See what's selling, spot trends early, and make pricing and inventory decisions backed by real data.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#0B0F19]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-[#FAFAF8]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B0F19]">
              <Store size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              SellerSquare
              <span className="ml-1.5 text-[#6B7280] font-normal">
                Seller
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Become a seller
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[#6B7280]">
            Now onboarding sellers nationwide
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Run your store like a
            <span className="block text-[#2563EB]">business, not a side hustle</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6B7280]">
            List products, fulfill orders, and track revenue from one
            dashboard built for sellers who want to scale.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Start selling
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#0B0F19] transition-colors hover:bg-black/5"
            >
              Seller login
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 divide-x divide-black/10 rounded-2xl border border-black/10 bg-white py-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-4 text-center">
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-[#6B7280]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-28 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to sell, in order
          </h2>
          <p className="mt-4 text-[#6B7280]">
            From your first listing to your thousandth order, SellerSquare
            covers each stage of running a store.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Signature connecting line — visible on desktop, encodes the product → order → growth flow */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-12 hidden border-t border-dashed border-black/15 md:block"
            style={{ marginInline: "16.6%" }}
          />

          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative rounded-2xl border border-black/10 bg-white p-7 transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {feature.description}
                </p>
                <span className="absolute right-6 top-7 text-xs font-medium text-black/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-[#6B7280] sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <Store size={16} />
            <span>© 2026 SellerSquare Seller Portal</span>
          </div>
          <div className="flex gap-6">
            <Link href="/help" className="hover:text-[#0B0F19]">
              Help center
            </Link>
            <Link href="/terms" className="hover:text-[#0B0F19]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#0B0F19]">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}