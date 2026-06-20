"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Inbox,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

interface Order {
  id: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  total: number;
  status: OrderStatus;
}

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type LoadState = "loading" | "error" | "ready";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setState("loading");
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const previous = orders;
    setUpdatingId(orderId);

    // Update locally first so the dropdown reflects the choice immediately,
    // and roll back only that row if the request fails.
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    try {
      await api.put(`/seller/orders/${orderId}`, { status });
    } catch {
      setOrders(previous);
      alert("Couldn't update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Orders</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {state === "ready" && `${orders.length} order${orders.length === 1 ? "" : "s"} total.`}
          {state === "loading" && "Loading your orders…"}
          {state === "error" && "We couldn't load your orders."}
        </p>
      </div>

      <div className="mt-8">
        {state === "loading" && <TableSkeleton />}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">Couldn&apos;t load your orders</p>
              <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchOrders}
              className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#6B7280]">
              <Inbox size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">No orders yet</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Orders will show up here as customers buy your products.
              </p>
            </div>
          </div>
        )}

        {state === "ready" && orders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <table className="w-full">
              <thead className="border-b border-black/10 bg-black/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Product
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Qty
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Update status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-black/[0.015]">
                    <td className="px-5 py-3 text-sm font-medium text-[#0B0F19]">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#0B0F19]">{order.product_name}</td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{order.quantity}</td>
                    <td className="px-5 py-3 text-sm text-[#0B0F19]">
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[order.status]}`}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === order.id && (
                          <Loader2 size={14} className="animate-spin text-[#6B7280]" />
                        )}
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value as OrderStatus)
                          }
                          disabled={updatingId === order.id}
                          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm text-[#0B0F19] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-black/[0.02] px-5 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-3.5 w-28 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-32 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-10 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-black/5" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}