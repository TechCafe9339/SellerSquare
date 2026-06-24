"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  seller_id: string;
}

interface Order {
  order_id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];

// Dynamic badge color helper for statuses
const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "packed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "shipped":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/seller/orders/");
      setOrders(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);

      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // Skeleton UI Loader
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2"><div className="h-5 w-32 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-40 bg-gray-200 rounded animate-pulse" /></div>
              <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-px bg-gray-100 w-full" />
            <div className="h-12 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Seller Orders
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage, track, and update status logs for incoming orders.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="text-sm text-gray-500 mt-1">When customers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    Order <span className="text-indigo-600 font-mono">#{order.order_id.slice(-8).toUpperCase()}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Customer: <span className="font-medium text-gray-700">{order.address?.full_name}</span>
                  </p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Core Layout split into items vs delivery details */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Products Column */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Line Items</h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl px-4 bg-gray-50/30">
                    {order.items?.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex justify-between items-center py-3.5 text-sm"
                      >
                        <div className="pr-4">
                          <h4 className="font-medium text-gray-800 break-words">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900 whitespace-nowrap">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Summary Column */}
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600 space-y-0.5 leading-relaxed">
                      <p className="font-medium text-gray-800">{order.address?.address}</p>
                      <p>{order.address?.city}, {order.address?.state} - <span className="font-mono">{order.address?.pincode}</span></p>
                      <p className="pt-1 text-xs text-gray-500 flex items-center gap-1">
                        <span>📞</span> {order.address?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-sm font-medium text-gray-500">Earnings Total:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₹{order.total_amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-gray-50/30 px-6 py-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Order Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => {
                    const isCurrent = order.status === status;
                    return (
                      <button
                        key={status}
                        disabled={isCurrent}
                        onClick={() => updateStatus(order.order_id, status)}
                        className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-150 ${
                          isCurrent
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}