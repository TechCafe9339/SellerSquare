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
    const [deliveryPincode, setDeliveryPincode] =
        useState("");

    const [deliveryAvailable, setDeliveryAvailable] =
        useState<boolean | null>(null);

    const [couponCode, setCouponCode] =
        useState("");

    const [discount, setDiscount] =
        useState(0);


    useEffect(() => {
        fetchProduct();
        // Reset quantity whenever navigating to a different product id.
        setQuantity(1);
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setNotFound(false);

            const res = await api.get(`/customer/${params.id}`);
            setProduct(res.data ?? null);
            if (!res.data) setNotFound(true);
        } catch (error) {
            console.error(error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const outOfStock = !!product && product.stock <= 0;
    const lowStock = !!product && product.stock > 0 && product.stock <= 5;

    // Shared guard: every purchase-related action needs a logged-in user.
    // Centralized so Add to Cart and Buy Now can't drift out of sync on
    // where they send people or what message they show.
    const requireAuth = (message: string) => {
        const token = localStorage.getItem("customer_token");
        if (!token) {
            toast.error(message);
            router.push("/login");
            return false;
        }
        return true;
    };

    // --- Cart -----------------------------------------------------------

    const toggleCart = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to add items to cart")) return;
        if (isCartPending || outOfStock) return;

        const goingIntoCart = !product.inCart;

        setIsCartPending(true);
        setProduct((prev) => (prev ? { ...prev, inCart: goingIntoCart } : prev));

        try {
            if (goingIntoCart) {
                await api.post("/cart/add", {
                    product_id: product.id,
                    quantity,
                });
                toast.success("Added to cart");
            } else {
                await api.post("/cart/remove", {
                    product_id: product.id,
                });
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

    // --- Wishlist ---------------------------------------------------------

    const toggleWishlist = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to use wishlist")) return;
        if (isWishlistPending) return;

        const goingIntoWishlist = !product.inWishlist;

        setIsWishlistPending(true);
        setProduct((prev) =>
            prev ? { ...prev, inWishlist: goingIntoWishlist } : prev
        );

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
            setProduct((prev) =>
                prev ? { ...prev, inWishlist: !goingIntoWishlist } : prev
            );
        } finally {
            setIsWishlistPending(false);
        }
    }, [product, isWishlistPending, router]);

    // --- Buy Now ------------------------------------------------------------
    // Skips the "stay on this page" cart toggle entirely: adds this item to
    // the cart (so checkout has something to bill) and sends the person
    // straight to checkout, the way Amazon/Flipkart-style Buy Now works.

    const buyNow = useCallback(async () => {
        if (!product) return;
        if (!requireAuth("Please login to continue")) return;
        if (isBuyNowPending || outOfStock) return;

        setIsBuyNowPending(true);

        try {
            await api.post("/cart/add", {
                product_id: product.id,
                quantity,
            });
            router.push(`/checkout?product_id=${product.id}&quantity=${quantity}`);
        } catch (err) {
            console.error(err);
            toast.error("Couldn't start checkout, please try again");
            setIsBuyNowPending(false);
        }
    }, [product, isBuyNowPending, outOfStock, quantity, router]);

    // --- Quantity ---------------------------------------------------------

    const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
    const incrementQuantity = () =>
        setQuantity((q) => Math.min(product?.stock ?? 1, q + 1));

    if (loading) {
        return <ProductPageSkeleton />;
    }

    if (notFound || !product) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Product not found
                </h1>
                <p className="text-gray-500 mt-2">
                    This product may have been removed or the link is incorrect.
                </p>
                <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 mt-6 text-indigo-600 font-medium hover:underline"
                >
                    Browse all products
                    <ChevronRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {/* Breadcrumb */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap"
            >
                <Link href="/" className="hover:text-gray-900">
                    Home
                </Link>
                <ChevronRight size={14} className="shrink-0" />
                <Link href="/products" className="hover:text-gray-900">
                    Products
                </Link>
                <ChevronRight size={14} className="shrink-0" />
                <span className="text-gray-900 font-medium truncate">
                    {product.name}
                </span>
            </nav>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
                {/* Image */}
                <div>
                    <div className="relative h-[280px] xs:h-[340px] sm:h-[420px] lg:h-[500px] bg-white rounded-xl border border-gray-200">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain p-6 sm:p-8"
                            priority
                        />

                        {outOfStock && (
                            <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                                Out of stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div>
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-medium">
                        {product.category}
                    </p>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-1 leading-tight">
                        {product.name}
                    </h1>

                    {(product.rating ?? 0) > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                {product.rating!.toFixed(1)}
                                <Star size={12} className="fill-white" />
                            </span>
                            {!!product.ratingCount && (
                                <span className="text-sm text-gray-500">
                                    {product.ratingCount.toLocaleString("en-IN")} ratings
                                </span>
                            )}
                        </div>
                    )}

                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mt-5 sm:mt-6">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 text-sm">
                        {outOfStock ? (
                            <span className="text-red-600 font-medium">Out of stock</span>
                        ) : lowStock ? (
                            <span className="text-amber-600 font-medium">
                                Only {product.stock} left — order soon
                            </span>
                        ) : (
                            <span className="text-green-600 font-medium">In stock</span>
                        )}
                    </div>

                    {/* Quantity stepper */}
                    {!outOfStock && (
                        <div className="flex items-center gap-3 mt-6">
                            <span className="text-sm font-medium text-gray-700">
                                Quantity
                            </span>
                            <div className="inline-flex items-center border border-gray-200 rounded-lg">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                    className="p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-l-lg"
                                >
                                    <Minus size={15} />
                                </button>
                                <span className="w-10 text-center text-sm font-semibold tabular-nums">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={quantity >= product.stock}
                                    aria-label="Increase quantity"
                                    className="p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mt-7 sm:mt-8">
                        <h2 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900">
                            Description
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-7 sm:mt-8">
                        <button
                            onClick={toggleCart}
                            disabled={isCartPending || outOfStock}
                            className={
                                "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 " +
                                (product.inCart
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50")
                            }
                        >
                            {product.inCart ? (
                                <>
                                    <Check size={16} />
                                    In cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={16} />
                                    Add to cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={buyNow}
                            disabled={isBuyNowPending || outOfStock}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {outOfStock ? "Out of stock" : isBuyNowPending ? "Starting checkout..." : "Buy now"}
                        </button>

                        <button
                            onClick={toggleWishlist}
                            disabled={isWishlistPending}
                            aria-label={product.inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            aria-pressed={!!product.inWishlist}
                            className="inline-flex items-center justify-center gap-2 border border-gray-300 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Heart
                                size={18}
                                className={
                                    product.inWishlist ? "fill-rose-500 text-rose-500" : ""
                                }
                            />
                            <span className="text-sm font-medium sm:hidden">
                                {product.inWishlist ? "Wishlisted" : "Wishlist"}
                            </span>
                        </button>
                    </div>

                    <div className="mt-8 border rounded-xl p-4">
                        <h3 className="font-semibold text-lg">
                            Delivery
                        </h3>

                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={deliveryPincode}
                                onChange={(e) =>
                                    setDeliveryPincode(e.target.value)
                                }
                                placeholder="Enter pincode"
                                className="border rounded-lg px-3 py-2 flex-1"
                            />

                            <button
                                onClick={() => {
                                    setDeliveryAvailable(
                                        deliveryPincode.length === 6
                                    );
                                }}
                                className="bg-indigo-600 text-white px-4 rounded-lg"
                            >
                                Check
                            </button>
                        </div>

                        {deliveryAvailable === true && (
                            <p className="text-green-600 mt-2">
                                Delivery available in your area
                            </p>
                        )}

                        {deliveryAvailable === false && (
                            <p className="text-red-600 mt-2">
                                Invalid pincode
                            </p>
                        )}
                    </div>

                    <div className="mt-8 border rounded-xl p-4">
                        <h3 className="font-semibold text-lg">
                            Available Offers
                        </h3>

                        <ul className="mt-3 space-y-2">
                            <li className="text-green-600">
                                Bank Offer: 10% Instant Discount
                            </li>

                            <li className="text-green-600">
                                Free Delivery
                            </li>

                            <li className="text-green-600">
                                PRIME100 → ₹100 OFF
                            </li>
                        </ul>

                        <div className="flex gap-2 mt-4">
                            <input
                                value={couponCode}
                                onChange={(e) =>
                                    setCouponCode(e.target.value)
                                }
                                placeholder="Enter coupon"
                                className="border rounded-lg px-3 py-2 flex-1"
                            />

                            <button
                                onClick={() => {
                                    if (
                                        couponCode.toUpperCase() ===
                                        "PRIME100"
                                    ) {
                                        setDiscount(100);
                                        toast.success(
                                            "Coupon applied"
                                        );
                                    }
                                }}
                                className="bg-green-600 text-white px-4 rounded-lg"
                            >
                                Apply
                            </button>
                        </div>
                        <p className="text-4xl font-bold">
                            ₹
                            {(
                                product.price - discount
                            ).toLocaleString("en-IN")}
                        </p>
                    </div>



                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 pt-6 border-t border-gray-100 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <Truck size={20} className="text-gray-400" />
                            <span className="text-[11px] sm:text-xs text-gray-500">
                                Fast delivery
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <RotateCcw size={20} className="text-gray-400" />
                            <span className="text-[11px] sm:text-xs text-gray-500">
                                Easy returns
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <ShieldCheck size={20} className="text-gray-400" />
                            <span className="text-[11px] sm:text-xs text-gray-500">
                                Secure payment
                            </span>
                        </div>
                    </div>


                    <div className="mt-10">
                        <h2 className="text-xl font-bold">
                            Ratings & Reviews
                        </h2>

                        <div className="mt-4 border rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white px-2 py-1 rounded">
                                    4.6
                                </span>

                                <span>
                                    12,450 Ratings
                                </span>
                            </div>

                            <div className="mt-4 space-y-4">

                                <div>
                                    <p className="font-semibold">
                                        Rajesh Kumar
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        Excellent product. Worth the money.
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        Priya Sharma
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        Delivery was fast and quality is good.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
            <div className="h-4 w-48 bg-gray-100 rounded mb-6" />

            <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
                <div className="h-[280px] xs:h-[340px] sm:h-[420px] lg:h-[500px] bg-gray-100 rounded-xl" />

                <div>
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                    <div className="h-8 w-3/4 bg-gray-100 rounded mt-3" />
                    <div className="h-6 w-28 bg-gray-100 rounded mt-4" />
                    <div className="h-10 w-40 bg-gray-100 rounded mt-6" />
                    <div className="h-4 w-24 bg-gray-100 rounded mt-3" />

                    <div className="space-y-2 mt-8">
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                    </div>

                    <div className="flex gap-3 mt-8">
                        <div className="h-10 w-32 bg-gray-100 rounded-lg" />
                        <div className="h-12 flex-1 bg-gray-100 rounded-xl" />
                        <div className="h-10 w-12 sm:h-12 sm:w-32 bg-gray-100 rounded-lg sm:rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}