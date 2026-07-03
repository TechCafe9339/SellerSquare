import Link from "next/link";
import { ShieldCheck, Users, Package, ShoppingBag, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    icon: Users,
    title: "Sellers",
    description: "Review applications, approve new sellers, and manage existing accounts.",
  },
  {
    icon: Package,
    title: "Products",
    description: "Monitor listings across the marketplace and act on policy violations.",
  },
  {
    icon: ShoppingBag,
    title: "Orders",
    description: "Track order volume and step in on disputes or fulfillment issues.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B0F19]">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#0B0F19]">
            SellerSquare
            <span className="ml-1.5 font-normal text-[#6B7280]">Admin</span>
          </span>
        </div>

        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8 sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19] sm:text-3xl">
              Marketplace control panel
            </h1>
            <p className="mt-2 text-[#6B7280]">
              Manage sellers, products, and orders across the marketplace.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="rounded-xl border border-black/10 bg-[#FAFAF8] p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[#0B0F19]">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                    {section.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Admin login
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-[#9CA3AF]">
            Admin access is invite-only. Contact your marketplace owner if you need an account.
          </p>
        </div>
      </div>
    </div>
  );
}