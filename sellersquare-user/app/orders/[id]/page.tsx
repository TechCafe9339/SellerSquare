"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
    Package,
    MapPin,
    CreditCard,
    CheckCircle,
    Clock,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Receipt
} from "lucide-react";

interface Order {
    id: string;
    items: {
        product_id: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    total_amount: number;
    status: string;
    address: {
        full_name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    payment_method: string;
    created_at: string;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const orderId = params?.id as string;

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/orders/my-orders/${orderId}`);
                setOrder(res.data ?? null);
            } catch (error) {
                console.error(error);
            } {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // UI Configuration Mapping based on Order Fulfillment Pipeline state
    const getStatusConfig = (status: string) => {
        const lower = status?.toLowerCase() || "";
        if (lower === "delivered") {
            return {
                color: "text-emerald-700 bg-emerald-50/60 border-emerald-100",
                icon: <CheckCircle className="text-emerald-600 shrink-0" size={22} />,
            };
        }
        if (lower === "cancelled" || lower === "failed") {
            return {
                color: "text-rose-700 bg-rose-50/60 border-rose-100",
                icon: <AlertTriangle className="text-rose-600 shrink-0" size={22} />,
            };
        }
        return {
            color: "text-amber-700 bg-amber-50/60 border-amber-100",
            icon: <Clock className="text-amber-600 shrink-0" size={22} />,
        };
    };

    if (loading) return <OrderDetailsSkeleton />;

    if (!order) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Order view restricted</h1>
                <p className="text-sm text-gray-500 mt-1.5">This entry path may have been modified or is currently unavailable.</p>
                <button onClick={() => router.push("/orders")} className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">
                    <ArrowLeft size={16} /> Back to My Orders
                </button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
            {/* Header Title Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div className="space-y-1">
                    <button 
                        onClick={() => router.push("/orders")} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-indigo-600 transition mb-1"
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} /> Back to History
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                        Order Details
                    </h1>
                </div>
                {order.created_at && (
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-slate-50 border border-gray-100 px-3 py-1.5 rounded-xl self-start sm:self-auto font-medium">
                        <Calendar size={15} className="text-gray-400" />
                        <span>Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                )}
            </div>

            {/* Dashboard Tracking Banner */}
            <div className={`border rounded-2xl p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 ${statusConfig.color}`}>
                <div className="flex items-center gap-3.5 min-w-0">
                    {statusConfig.icon}
                    <div className="min-w-0">
                        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider opacity-60">Shipment Status</h2>
                        <p className="font-extrabold text-base sm:text-lg mt-0.5 tracking-tight">{order.status}</p>
                    </div>
                </div>
                <span className="font-mono text-xs sm:text-sm font-bold opacity-60 uppercase shrink-0 bg-white/60 px-2 py-1 rounded-md border border-black/5">
                    #{order.id.slice(-8)}
                </span>
            </div>

            {/* Core Workspace Splitting Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Main Product Manifest Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-50 mb-1">
                            <Package size={18} className="text-gray-400" />
                            <h2 className="font-bold text-gray-900 tracking-tight">Ordered Items</h2>
                        </div>

                        <div className="divide-y divide-gray-100 font-medium text-sm text-gray-700">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start gap-4 py-4 last:pb-0">
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 break-words leading-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-gray-400 bg-slate-50 px-2 py-0.5 rounded border inline-block">
                                            Quantity: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <span className="font-extrabold text-gray-900 shrink-0">
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Context Sidebar Panel Stack */}
                <div className="space-y-6">
                    {/* Destination Mapping Details */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3 text-sm">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <MapPin size={18} className="text-gray-400" />
                            <h2 className="font-bold text-gray-900 tracking-tight">Shipping Destination</h2>
                        </div>
                        <div className="space-y-1 font-medium text-gray-600 leading-relaxed">
                            <p className="font-bold text-gray-900 text-base">{order.address.full_name}</p>
                            <p className="text-xs font-semibold text-gray-400">Mobile: {order.address.phone}</p>
                            <p className="pt-1 text-gray-700 break-words">{order.address.address}</p>
                            <p className="text-gray-600">
                                {order.address.city}, {order.address.state} — <span className="font-bold text-gray-800 tracking-wide">{order.address.pincode}</span>
                            </p>
                        </div>
                    </div>

                    {/* Settlement Metrics Ledger */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 text-sm font-medium">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                            <Receipt size={18} className="text-gray-400" />
                            <h2 className="font-bold text-gray-900 tracking-tight">Billing Summary</h2>
                        </div>
                        
                        <div className="space-y-2.5 text-gray-500 border-b border-gray-50 pb-3.5">
                            <div className="flex justify-between items-center">
                                <span className="inline-flex items-center gap-1.5"><CreditCard size={14} /> Settlement Mode</span>
                                <span className="text-gray-900 font-bold tracking-wide uppercase bg-slate-100 px-2 py-0.5 rounded text-xs">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Logistic Routing</span>
                                <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">FREE SHIPPING</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline text-gray-900">
                            <span className="font-extrabold text-gray-900">Total Settlement</span>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-indigo-600">
                                ₹{order.total_amount.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function OrderDetailsSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded-md" />
                    <div className="h-7 w-48 bg-gray-200 rounded-md" />
                </div>
                <div className="h-8 w-36 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-20 w-full bg-gray-50 border rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 h-48 bg-gray-50 border rounded-2xl" />
                <div className="space-y-6">
                    <div className="h-40 bg-gray-50 border rounded-2xl" />
                    <div className="h-40 bg-gray-50 border rounded-2xl" />
                </div>
            </div>
        </div>
    );
}