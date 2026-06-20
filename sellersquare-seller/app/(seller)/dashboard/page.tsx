"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface RecentProduct {
  id: string;
  name: string;
  price: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface DashboardData {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  revenue: number;
  recent_products: RecentProduct[];
  low_stock_products: LowStockProduct[];
}

type LoadState = "loading" | "error" | "ready";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  const fetchDashboard = () => {
    setState("loading");
    api
      .get("/seller/dashboard")
      .then((res) => {
        setData(res.data);
        setState("ready");
      })
      .catch(() => {
        setState("error");
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            A snapshot of your store right now.
          </p>
        </div>

        {state === "ready" && (
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
      </div>

      <div className="mt-8">
        {state === "loading" && <DashboardSkeleton />}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">
                Couldn&apos;t load your dashboard
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Check your connection and try again.
              </p>
            </div>
            <button
              onClick={fetchDashboard}
              className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Package}
                label="Total products"
                value={data.total_products.toLocaleString("en-IN")}
                accent="blue"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total orders"
                value={data.total_orders.toLocaleString("en-IN")}
                accent="blue"
              />
              <StatCard
                icon={Clock}
                label="Pending orders"
                value={data.pending_orders.toLocaleString("en-IN")}
                accent={data.pending_orders > 0 ? "amber" : "green"}
              />
              <StatCard
                icon={IndianRupee}
                label="Revenue"
                value={`₹${data.revenue.toLocaleString("en-IN")}`}
                accent="green"
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Recent products */}
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold tracking-tight text-[#0B0F19]">
                    Recent products
                  </h2>
                  <Link
                    href="/products"
                    className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View all
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {data.recent_products?.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-[#6B7280]">
                    No products yet.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-black/5">
                    {data.recent_products?.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="text-[#0B0F19]">{product.name}</span>
                        <span className="font-medium text-[#0B0F19]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low stock alert */}
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-[#0B0F19]">
                    Low stock alert
                  </h2>
                  <Link
                    href="/products"
                    className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View all
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {data.low_stock_products?.length === 0 ? (
                  <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
                    <p className="text-sm text-[#6B7280]">
                      No low stock products. You&apos;re all set.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-black/5">
                    {data.low_stock_products?.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between py-2.5 text-sm"
                      >
                        <span className="flex items-center gap-2 text-[#0B0F19]">
                          <AlertTriangle size={14} className="text-amber-500" />
                          {product.name}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "blue",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  accent?: "blue" | "green" | "amber";
}) {
  const accentClasses = {
    blue: "bg-[#2563EB]/10 text-[#2563EB]",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  }[accent];

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses}`}>
        <Icon size={18} />
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-[#0B0F19]">
        {value}
      </div>
      <div className="mt-1 text-sm text-[#6B7280]">{label}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-black/10 bg-white p-5">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-black/5" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-black/5" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-black/5" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-3.5 w-full animate-pulse rounded bg-black/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}