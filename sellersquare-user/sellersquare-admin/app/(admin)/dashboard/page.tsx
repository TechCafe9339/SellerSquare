"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Check,
  X as XIcon,
  Loader2,
  UserCheck,
  ImageOff,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface DashboardData {
  total_sellers: number;
  total_products: number;
  total_orders: number;
  revenue: number;
  recent_sellers: RecentSeller[];
  recent_products: RecentProduct[];
  pending_sellers: PendingSeller[];
}

interface RecentSeller {
  id: string;
  business_name: string;
  owner_name: string;
  joined_at?: string;
}

interface RecentProduct {
  id: string;
  name: string;
  seller_name: string;
  price: number;
  image_url?: string;
}

interface PendingSeller {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
}

type LoadState = "loading" | "error" | "ready";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setState("loading");
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const decideSeller = async (sellerId: string, approve: boolean) => {
    if (!data) return;
    const previous = data;
    setDecidingId(sellerId);

    // Remove from the pending list immediately; roll back on failure.
    setData({
      ...data,
      pending_sellers: data.pending_sellers.filter((s) => s.id !== sellerId),
      total_sellers: approve ? data.total_sellers + 1 : data.total_sellers,
    });

    try {
      await api.put(`/admin/sellers/${sellerId}/${approve ? "approve" : "reject"}`);
      showToast(approve ? "Seller approved." : "Seller rejected.", {
        variant: approve ? "success" : "default",
      });
    } catch {
      setData(previous);
      showToast("That didn't go through. Please try again.", { variant: "error" });
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            An overview of the marketplace right now.
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
              <p className="font-medium text-[#0B0F19]">Couldn&apos;t load the dashboard</p>
              <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total sellers"
                value={data.total_sellers.toLocaleString("en-IN")}
                icon={<Users size={20} />}
                accent="blue"
              />
              <StatCard
                title="Total products"
                value={data.total_products.toLocaleString("en-IN")}
                icon={<Package size={20} />}
                accent="blue"
              />
              <StatCard
                title="Total orders"
                value={data.total_orders.toLocaleString("en-IN")}
                icon={<ShoppingCart size={20} />}
                accent="blue"
              />
              <StatCard
                title="Revenue"
                value={`₹${data.revenue.toLocaleString("en-IN")}`}
                icon={<IndianRupee size={20} />}
                accent="green"
              />
            </div>

            {/* Pending seller approvals */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-[#0B0F19]">
                  <UserCheck size={17} className="text-[#2563EB]" />
                  Pending seller approvals
                </h2>
                {data?.pending_sellers?.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    {data.pending_sellers.length} waiting
                  </span>
                )}
              </div>

              {data?.pending_sellers?.length === 0 ? (
                <p className="mt-6 text-center text-sm text-[#6B7280]">
                  No pending applications. You&apos;re all caught up.
                </p>
              ) : (
                <div className="mt-4 divide-y divide-black/5">
                  {data?.pending_sellers?.map((seller) => (
                    <div
                      key={seller.id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#0B0F19]">
                          {seller.business_name}
                        </p>
                        <p className="truncate text-xs text-[#6B7280]">
                          {seller.owner_name} · {seller.email}
                        </p>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {decidingId === seller.id ? (
                          <Loader2 size={16} className="animate-spin text-[#6B7280]" />
                        ) : (
                          <>
                            <button
                              onClick={() => decideSeller(seller.id, true)}
                              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                            >
                              <Check size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => decideSeller(seller.id, false)}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <XIcon size={13} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Recent sellers */}
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold tracking-tight text-[#0B0F19]">
                    Recent sellers
                  </h2>
                  <Link
                    href="/sellers"
                    className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    View all
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {data?.recent_sellers?.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-[#6B7280]">No sellers yet.</p>
                ) : (
                  <div className="mt-4 divide-y divide-black/5">
                    {data?.recent_sellers?.map((seller) => (
                      <div key={seller.id} className="flex items-center gap-3 py-2.5">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0B0F19] text-xs font-semibold text-white">
                          {seller.business_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0B0F19]">
                            {seller.business_name}
                          </p>
                          <p className="truncate text-xs text-[#6B7280]">{seller.owner_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

                {data?.recent_products?.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-[#6B7280]">No products yet.</p>
                ) : (
                  <div className="mt-4 divide-y divide-black/5">
                    {data?.recent_products?.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 py-2.5">
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                              <ImageOff size={14} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#0B0F19]">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-[#6B7280]">
                            {product.seller_name}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-sm font-medium text-[#0B0F19]">
                          ₹{product.price.toLocaleString("en-IN")}
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
  title,
  value,
  icon,
  accent = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "blue" | "green";
}) {
  const accentClasses = {
    blue: "bg-[#2563EB]/10 text-[#2563EB]",
    green: "bg-green-50 text-green-600",
  }[accent];

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{title}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B0F19]">{value}</h2>
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${accentClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-black/10 bg-white p-5">
            <div className="h-3.5 w-20 animate-pulse rounded bg-black/5" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-black/5" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <div className="h-4 w-44 animate-pulse rounded bg-black/5" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-black/5" />
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-9 w-full animate-pulse rounded bg-black/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}