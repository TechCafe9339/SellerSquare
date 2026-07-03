"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: {
        name: string;
        quantity: number;
    }[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await api.get("/orders/my-orders");
                setOrders(res.data ?? []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Status variant generator mapping
    const getStatusStyles = (status: string) => {
        const lower = status?.toLowerCase() || "";
        if (lower === "delivered") {
            return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
        }
        if (lower === "cancelled" || lower === "failed") {
            return "bg-rose-50 text-rose-700 border-rose-200/60";
        }
        return "bg-amber-50 text-amber-700 border-amber-200/60"; // Pending / Processing
    };

    if (loading) return <OrdersSkeleton />;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 sm:mb-8 text-gray-900">
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 sm:py-24 border border-dashed border-gray-200 rounded-2xl bg-slate-50/50 px-4">
                    <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
                        <Package size={26} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        No Orders Placed Yet
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                        Your purchase log looks clear. Start browsing our catalog to place your first order.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm"
                    >
                        <ShoppingBag size={16} />
                        Explore Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden hover:border-gray-200 transition"
                        >
                            {/* Order Header / Metadata Row */}
                            <div className="bg-slate-50/70 px-4 py-3.5 sm:px-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-sm">
                                <div className="space-y-0.5">
                                    <p className="font-bold text-gray-900">
                                        Order ID: <span className="text-indigo-600 font-mono tracking-tight uppercase">#{order.id.slice(-8)}</span>
                                    </p>
                                    {order.created_at && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                            <Calendar size={13} className="text-gray-400" />
                                            <span>
                                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm ${getStatusStyles(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Main Body Element Stack */}
                            <div className="p-4 sm:p-5 space-y-4">
                                <div className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                                    {order.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0"
                                        >
                                            <span className="text-gray-800 break-words pr-4 line-clamp-1">
                                                {item.name}
                                            </span>
                                            <span className="text-gray-400 font-semibold text-xs shrink-0 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-md">
                                                Qty: {item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary Actions Deck */}
                                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Charged</p>
                                        <p className="font-black text-lg sm:text-xl text-gray-900 tracking-tight">
                                            ₹{order.total_amount.toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-100/80 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:bg-slate-50 transition group"
                                    >
                                        Details
                                        <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function OrdersSkeleton() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse space-y-6">
            <div className="h-8 w-36 bg-gray-200 rounded-md mb-2" />
            <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-2xl bg-white overflow-hidden space-y-4">
                        <div className="h-12 bg-gray-50 border-b border-gray-100" />
                        <div className="p-5 space-y-3">
                            <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
                            <div className="h-4 w-1/2 bg-gray-200 rounded-md" />
                            <div className="h-10 w-full bg-gray-100 rounded-xl mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}