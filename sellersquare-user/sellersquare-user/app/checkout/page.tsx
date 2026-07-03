"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MapPin, CreditCard, Truck, Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface Address {
    id: string;
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

interface CartItem {
    cart_id: string;
    name: string;
    price: number;
    quantity: number;
}

export default function CheckoutPage() {
    const router = useRouter();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [addressRes, cartRes] = await Promise.all([
                    api.get("/address/"),
                    api.get("/cart/")
                ]);

                const fetchedAddresses = addressRes.data ?? [];
                const fetchedCart = cartRes.data ?? [];

                setAddresses(fetchedAddresses);
                setCartItems(fetchedCart);

                if (fetchedAddresses.length > 0) {
                    setSelectedAddress(fetchedAddresses[0].id);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load checkout details");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const placeOrder = async () => {
        if (!selectedAddress) {
            toast.error("Please select a delivery address");
            return;
        }

        try {
            setIsPlacingOrder(true);
            await api.post("/orders/checkout", {
                address_id: selectedAddress,
                payment_method: paymentMethod,
            });

            toast.success("Order placed successfully!");
            router.push("/orders");
        } catch (error) {
            console.error(error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (loading) return <CheckoutSkeleton />;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={28} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your cart is empty</h1>
                <p className="text-gray-500 text-sm mt-2">Add some products to your cart before proceeding to checkout.</p>
                <Link href="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition">
                    <ArrowLeft size={16} />
                    Return to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 sm:mb-8 text-gray-900">
                Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Logistics Configuration */}
                <div className="lg:col-span-7 space-y-6 sm:space-y-8">
                    
                    {/* Address Selector Container */}
                    <div>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                                <MapPin size={20} className="text-gray-500" /> Delivery Address
                            </h2>
                            <Link href="/address" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
                                + Add New Address
                            </Link>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center bg-slate-50/50">
                                <p className="text-sm text-gray-500 font-medium mb-3">No delivery addresses found.</p>
                                <Link href="/address" className="inline-flex text-xs font-bold bg-white border px-3 py-2 rounded-lg text-indigo-600 shadow-sm hover:bg-gray-50">
                                    Create Address Entry
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((address) => {
                                    const isSelected = selectedAddress === address.id;
                                    return (
                                        <label
                                            key={address.id}
                                            className={`relative flex items-start gap-4 border rounded-2xl p-4 cursor-pointer bg-white transition shadow-sm select-none ${
                                                isSelected 
                                                    ? "border-indigo-600 ring-2 ring-indigo-500/10" 
                                                    : "border-gray-100 hover:border-gray-200"
                                            }`}
                                        >
                                            <div className="pt-1">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedAddress(address.id)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                                    isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300 bg-white"
                                                }`}>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm font-medium text-gray-600 min-w-0">
                                                <p className="font-bold text-gray-900 text-base">{address.full_name}</p>
                                                <p className="text-xs text-gray-500 font-semibold">Mobile: {address.phone}</p>
                                                <p className="pt-1 text-gray-700 leading-relaxed break-words">{address.address}</p>
                                                <p className="text-gray-600">{address.city}, {address.state} — <span className="font-bold text-gray-800">{address.pincode}</span></p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Payment Form Blocks Selection */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-gray-500" /> Payment Method
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("COD")}
                                className={`flex items-center gap-3 border p-4 rounded-xl text-left transition bg-white shadow-sm font-semibold text-sm ${
                                    paymentMethod === "COD" 
                                        ? "border-indigo-600 ring-2 ring-indigo-500/10 text-indigo-600" 
                                        : "border-gray-100 hover:border-gray-200 text-gray-700"
                                }`}
                            >
                                <Truck size={18} className={paymentMethod === "COD" ? "text-indigo-600" : "text-gray-400"} />
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900">Cash On Delivery</p>
                                    <p className="text-xs font-medium text-gray-400 mt-0.5">Pay with cash upon arrival</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("ONLINE")}
                                className={`flex items-center gap-3 border p-4 rounded-xl text-left transition bg-white shadow-sm font-semibold text-sm ${
                                    paymentMethod === "ONLINE" 
                                        ? "border-indigo-600 ring-2 ring-indigo-500/10 text-indigo-600" 
                                        : "border-gray-100 hover:border-gray-200 text-gray-700"
                                }`}
                            >
                                <CreditCard size={18} className={paymentMethod === "ONLINE" ? "text-indigo-600" : "text-gray-400"} />
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900">Online UPI / Card</p>
                                    <p className="text-xs font-medium text-gray-400 mt-0.5">Instant secure portal settlement</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Ledger Sticky Deck */}
                <div className="lg:col-span-5 lg:sticky lg:top-6">
                    <div className="border border-gray-100 bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-1">
                            Order Summary
                        </h2>

                        {/* Items Sublist scroll deck */}
                        <div className="divide-y divide-gray-100 max-h-[240px] overflow-y-auto pr-1 text-sm font-medium text-gray-600 space-y-3">
                            {cartItems.map((item) => (
                                <div key={item.cart_id} className="flex justify-between items-start gap-4 pt-3 first:pt-0">
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 break-words leading-tight">{item.name}</p>
                                        <p className="text-xs text-gray-400 font-semibold mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                                    </div>
                                    <span className="font-bold text-gray-900 shrink-0">
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm font-medium text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-gray-800 font-semibold">₹{totalAmount.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fees</span>
                                <span className="text-emerald-600 font-bold">FREE</span>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline text-gray-900">
                                <span className="font-extrabold text-base">Total Payable</span>
                                <span className="text-2xl font-black tracking-tight">
                                    ₹{totalAmount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={placeOrder}
                            disabled={isPlacingOrder || addresses.length === 0}
                            className="w-full inline-flex items-center justify-center bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-100"
                        >
                            {isPlacingOrder ? (
                                <Loader2 size={18} className="animate-spin mr-2" />
                            ) : null}
                            Confirm & Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckoutSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse space-y-6">
            <div className="h-8 w-40 bg-gray-200 rounded-md mb-2" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-3">
                        <div className="h-5 w-32 bg-gray-200 rounded-md" />
                        <div className="h-24 w-full bg-gray-50 border rounded-2xl" />
                        <div className="h-24 w-full bg-gray-50 border rounded-2xl" />
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <div className="h-64 w-full bg-gray-50 border rounded-2xl" />
                </div>
            </div>
        </div>
    );
}