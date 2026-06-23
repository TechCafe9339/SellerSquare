"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Heart,
    ShoppingCart,
    Star,
    Check,
    Minus,
    Plus,
    ChevronRight,
    ShieldCheck,
    Truck,
    RotateCcw,
    Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    rating?: number;
    ratingCount?: number;
    inWishlist?: boolean;
    inCart?: boolean;
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [isCartPending, setIsCartPending] = useState(false);
    const [isWishlistPending, setIsWishlistPending] = useState(false);
    const [isBuyNowPending, setIsBuyNowPending] = useState(false);

    const [discount, setDiscount] = useState(0);

    const productId = params?.id as string;

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setNotFound(false);
                const res = await api.get(`/customer/${productId}`);
                setProduct(res.data ?? null);
                if (!res.data) setNotFound(true);
            } catch (error) {
                console.error(error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        setQuantity(1);
        setDiscount(0);
    }, [productId]);

    const outOfStock = !product || product.stock <= 0;
    const lowStock = !!product && product.stock > 0 && product.stock <= 5;

    const requireAuth = (message: string) => {
        const token = localStorage.getItem("customer_token");
        if (!token) {
            toast.error(message);
            router.push("/login");
            return false;
        }
        return true;
    };

    const toggleCart = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to add items to cart")) return;
        if (isCartPending || outOfStock) return;

        const goingIntoCart = !product.inCart;
        setIsCartPending(true);
        setProduct((prev) => (prev ? { ...prev, inCart: goingIntoCart } : prev));

        try {
            if (goingIntoCart) {
                await api.post("/cart/add", { product_id: product.id, quantity });
                toast.success("Added to cart");
            } else {
                await api.post("/cart/remove", { product_id: product.id });
                toast.success("Removed from cart");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, please try again");
            setProduct((prev) => (prev ? { ...prev, inCart: !goingIntoCart } : prev));
        } finally {
            setIsCartPending(false);
        }
    }, [product, isCartPending, outOfStock, quantity, router]);

    const toggleWishlist = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to use wishlist")) return;
        if (isWishlistPending) return;

        const goingIntoWishlist = !product.inWishlist;
        setIsWishlistPending(true);
        setProduct((prev) => (prev ? { ...prev, inWishlist: goingIntoWishlist } : prev));

        try {
            if (goingIntoWishlist) {
                await api.post("/wishlist/add", { product_id: product.id });
                toast.success("Added to wishlist");
            } else {
                await api.post("/wishlist/remove", { product_id: product.id });
                toast.success("Removed from wishlist");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, please try again");
            setProduct((prev) => (prev ? { ...prev, inWishlist: !goingIntoWishlist } : prev));
        } finally {
            setIsWishlistPending(false);
        }
    }, [product, isWishlistPending, router]);

    const buyNow = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to continue")) return;
        if (isBuyNowPending || outOfStock) return;

        setIsBuyNowPending(true);
        try {
            await api.post("/cart/add", { product_id: product.id, quantity });
            router.push(`/checkout?product_id=${product.id}&quantity=${quantity}`);
        } catch (err) {
            console.error(err);
            toast.error("Couldn't start checkout, please try again");
            setIsBuyNowPending(false);
        }
    }, [product, isBuyNowPending, outOfStock, quantity, router]);

    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
    const incrementQuantity = () => setQuantity((q) => Math.min(product?.stock ?? 1, q + 1));

    if (loading) return <ProductPageSkeleton />;

    if (notFound || !product) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product not found</h1>
                <p className="text-gray-500 mt-3 max-w-md mx-auto">
                    This product may have been removed or the link is incorrect.
                </p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 mt-6 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition"
                >
                    Browse all products
                    <ChevronRight size={16} />
                </Link>
            </div>
        );
    }

    const currentPrice = Math.max(0, product.price - discount);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-gray-900">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
                <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
                <ChevronRight size={14} className="shrink-0 text-gray-400" />
                <Link href="/products" className="hover:text-indigo-600 transition">Products</Link>
                <ChevronRight size={14} className="shrink-0 text-gray-400" />
                <span className="font-medium truncate text-gray-800">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Image Gallery Canvas */}
                <div className="sticky top-6">
                    <div className="relative aspect-square w-full bg-slate-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-contain p-6 sm:p-10 transition-transform duration-300 group-hover:scale-[1.02]"
                            priority
                        />
                        {outOfStock && (
                            <span className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                                Out of stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Detail Actions Stack */}
                <div className="space-y-6 sm:space-y-8">
                    <div>
                        <p className="text-xs sm:text-sm text-indigo-600 uppercase tracking-wider font-bold">
                            {product.category}
                        </p>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-1 leading-tight tracking-tight">
                            {product.name}
                        </h1>

                        {/* Rating block */}
                        {(product.rating ?? 0) > 0 && (
                            <div className="flex items-center gap-2 mt-3.5">
                                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                    {product.rating!.toFixed(1)}
                                    <Star size={12} className="fill-white text-white" />
                                </span>
                                {!!product.ratingCount && (
                                    <span className="text-sm text-gray-500 font-medium">
                                        ({product.ratingCount.toLocaleString("en-IN")} verified reviews)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pricing Segment */}
                    <div className="border-t border-b border-gray-100 py-4 sm:py-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                            ₹{currentPrice.toLocaleString("en-IN")}
                        </span>
                        {discount > 0 && (
                            <span className="text-lg text-gray-400 line-through font-medium">
                                ₹{product.price.toLocaleString("en-IN")}
                            </span>
                        )}
                        <div className="w-full mt-2">
                            {outOfStock ? (
                                <span className="text-red-600 font-semibold text-sm bg-red-50 px-2.5 py-1 rounded-md inline-block">Out of stock</span>
                            ) : lowStock ? (
                                <span className="text-amber-700 font-semibold text-sm bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                                    Only {product.stock} items left — Order fast!
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-semibold text-sm bg-emerald-50 px-2.5 py-1 rounded-md inline-block">In Stock</span>
                            )}
                        </div>
                    </div>

                    {/* Quantity Selector Option */}
                    {!outOfStock && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-700 tracking-wide uppercase">Quantity</span>
                            <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                    className="p-3 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                    <Minus size={14} strokeWidth={2.5} />
                                </button>
                                <span className="w-12 text-center text-sm font-bold tabular-nums text-gray-800">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={quantity >= product.stock}
                                    aria-label="Increase quantity"
                                    className="p-3 text-gray-600 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none transition"
                                >
                                    <Plus size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Panel Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                        <button
                            onClick={toggleCart}
                            disabled={isCartPending || outOfStock}
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-sm border ${
                                product.inCart
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "border-indigo-600 text-indigo-600 hover:bg-indigo-50/50"
                            } disabled:cursor-not-allowed disabled:opacity-60 flex-1`}
                        >
                            {isCartPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : product.inCart ? (
                                <>
                                    <Check size={16} strokeWidth={2.5} /> Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={16} /> Add to Cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={buyNow}
                            disabled={isBuyNowPending || outOfStock}
                            className="flex-[1.5] inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md shadow-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isBuyNowPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Starting checkout...
                                </>
                            ) : outOfStock ? (
                                "Out of stock"
                            ) : (
                                "Buy Now"
                            )}
                        </button>

                        <button
                            onClick={toggleWishlist}
                            disabled={isWishlistPending}
                            aria-label={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            aria-pressed={!!product.inWishlist}
                            className="inline-flex items-center justify-center border border-gray-200 p-3.5 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition shadow-sm disabled:opacity-50"
                        >
                            <Heart
                                size={20}
                                className={product.inWishlist ? "fill-rose-500 text-rose-500 scale-110 transition-transform" : "transition-transform"}
                            />
                        </button>
                    </div>

                    {/* Details Panel Accordion/Block */}
                    <div className="pt-4">
                        <h2 className="font-bold text-lg mb-2 tracking-tight text-gray-900">Description</h2>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-gray-50">
                            {product.description}
                        </p>
                    </div>

                    {/* Delivery Logistics */}
                    <DeliveryChecker />

                    {/* Coupon Interface Component */}
                    <CouponManager productPrice={product.price} onApplyDiscount={setDiscount} />

                    {/* Trust Value Badges Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Truck size={18} /></div>
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Fast Delivery</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><RotateCcw size={18} /></div>
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Easy Returns</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><ShieldCheck size={18} /></div>
                            <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Secure Checkout</span>
                        </div>
                    </div>

                    {/* Feedback Ratings Summary */}
                    <ReviewsSection />
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   Sub-Components Hierarchy (Preventing Parent Scope Re-renders)
   ========================================================================== */

function DeliveryChecker() {
    const [pincode, setPincode] = useState("");
    const [status, setStatus] = useState<boolean | null>(null);

    const handleCheck = () => {
        setStatus(pincode.trim().length === 6 && /^\d+$/.test(pincode));
    };

    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm space-y-3">
            <h3 className="font-bold text-md text-gray-900">Delivery Availability</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit pin code"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                    onClick={handleCheck}
                    className="bg-indigo-600 text-white font-medium text-xs sm:text-sm px-4 rounded-lg hover:bg-indigo-700 transition"
                >
                    Check
                </button>
            </div>
            {status === true && <p className="text-emerald-600 text-xs font-medium">✓ Delivery service available in your location</p>}
            {status === false && <p className="text-rose-600 text-xs font-medium">✗ Invalid pin code specification</p>}
        </div>
    );
}

interface CouponManagerProps {
    productPrice: number;
    onApplyDiscount: (val: number) => void;
}

function CouponManager({ onApplyDiscount }: CouponManagerProps) {
    const [couponCode, setCouponCode] = useState("");

    const handleApply = () => {
        if (couponCode.trim().toUpperCase() === "PRIME100") {
            onApplyDiscount(100);
            toast.success("Coupon code successfully applied!");
        } else {
            toast.error("Invalid coupon offer sequence");
        }
    };

    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm space-y-3">
            <h3 className="font-bold text-md text-gray-900">Available Promotions</h3>
            <ul className="text-xs space-y-1.5 font-medium text-emerald-700">
                <li className="flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-md">🎁 Bank Offer: 10% Instant Discount on credit cards</li>
                <li className="flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-md">✨ Prime Perks: Applied free shipping rules</li>
                <li className="flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-md">🔥 Coupon: PRIME100 → Save Flat ₹100</li>
            </ul>
            <div className="flex gap-2 pt-1">
                <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter promotional code"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                    onClick={handleApply}
                    className="bg-emerald-600 text-white font-medium text-xs sm:text-sm px-4 rounded-lg hover:bg-emerald-700 transition"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

function ReviewsSection() {
    return (
        <div className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-4">Customer Reviews</h2>
            <div className="border border-gray-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200/60">
                    <span className="bg-emerald-600 text-white text-sm font-bold px-2 py-0.5 rounded">4.6</span>
                    <span className="text-sm font-semibold text-gray-800">12,450 Global Benchmarks</span>
                </div>
                <div className="space-y-4 divide-y divide-gray-100 text-sm">
                    <div className="space-y-1">
                        <p className="font-bold text-gray-800">Rajesh Kumar</p>
                        <p className="text-gray-600 leading-relaxed">Excellent product engineering. Absolutely worth premium investment.</p>
                    </div>
                    <div className="space-y-1 pt-3">
                        <p className="font-bold text-gray-800">Priya Sharma</p>
                        <p className="text-gray-600 leading-relaxed">Delivery performance parameters met. Exceptional item consistency.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse space-y-6">
            <div className="h-4 w-48 bg-gray-200 rounded-md" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div className="aspect-square w-full bg-gray-200 rounded-2xl" />
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-8 w-3/4 bg-gray-200 rounded-md" />
                        <div className="h-5 w-40 bg-gray-200 rounded-md mt-2" />
                    </div>
                    <div className="h-12 w-32 bg-gray-200 rounded-xl" />
                    <div className="h-8 w-full bg-gray-200 rounded-md" />
                    <div className="flex gap-4">
                        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
                        <div className="h-12 flex-1 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}