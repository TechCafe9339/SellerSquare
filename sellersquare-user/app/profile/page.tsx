"use client";

import { useEffect, useMemo, useState } from "react";
import {
    User,
    MapPin,
    Heart,
    Package,
    LogOut,
    ChevronRight,
    Mail,
    Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/context/AuthContext";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get("/customer/profile");
                if (!cancelled) setCustomer(res.data ?? null);
            } catch (error) {
                console.error(error);
                if (!cancelled) {
                    toast.error("Please log in to view your profile");
                    router.push("/login");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, [router]);

    const initials = useMemo(() => {
        if (!customer?.name) return null;
        return customer.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("");
    }, [customer?.name]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoggingOut(false);
        }
    };

    if (loading) {
        return <ProfilePageSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
            {/* Header / Identity Banner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0 select-none"
                        aria-hidden="true"
                    >
                        {initials ? (
                            <span className="text-indigo-600 font-bold text-xl sm:text-2xl tracking-wide">
                                {initials}
                            </span>
                        ) : (
                            <User className="text-indigo-600" size={32} />
                        )}
                    </div>

                    <div className="space-y-1.5 min-w-0 w-full">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight truncate">
                            {customer?.name || "Guest Account"}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500 font-medium">
                            {customer?.email && (
                                <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0">
                                    <Mail size={14} className="text-gray-400 shrink-0" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer?.phone && (
                                <div className="flex items-center justify-center sm:justify-start gap-2 shrink-0">
                                    <Phone size={14} className="text-gray-400 shrink-0" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {!customer?.email && !customer?.phone && (
                                <span className="text-gray-400">No contact details on file</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Practical Navigation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 sm:mt-8">
                <ProfileCard
                    icon={<Package size={20} />}
                    title="My Orders"
                    subtitle="Track and review past purchases"
                    onClick={() => router.push("/orders")}
                />

                <ProfileCard
                    icon={<MapPin size={20} />}
                    title="My Addresses"
                    subtitle="Manage delivery addresses"
                    onClick={() => router.push("/address")}
                />

                <ProfileCard
                    icon={<Heart size={20} />}
                    title="Wishlist"
                    subtitle="View saved products"
                    onClick={() => router.push("/wishlist")}
                />

                <ProfileCard
                    icon={<User size={20} />}
                    title="Edit Profile"
                    subtitle="Update personal details"
                    onClick={() => toast("Coming soon")}
                />
            </div>

            {/* Session Actions Block */}
            <div className="flex pt-6 sm:pt-8 border-t border-gray-100 mt-6 sm:mt-8 justify-start">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-rose-700 active:bg-rose-800 transition shadow-sm shadow-rose-100 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:ring-offset-2"
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    {loggingOut ? "Logging out..." : "Logout Account"}
                </button>
            </div>
        </div>
    );
}

/* ==========================================================================
   Sub-Components Hierarchy
   ========================================================================== */

interface ProfileCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
}

function ProfileCard({ icon, title, subtitle, onClick }: ProfileCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition duration-200 text-left group flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight group-hover:text-indigo-600 transition">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5 truncate">
                        {subtitle}
                    </p>
                </div>
            </div>
            <ChevronRight
                size={18}
                className="text-gray-400 shrink-0 transition-transform duration-200 transform group-hover:translate-x-1 group-hover:text-indigo-500"
            />
        </button>
    );
}

function ProfilePageSkeleton() {
    return (
        <div
            className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse space-y-6"
            role="status"
            aria-label="Loading profile"
        >
            {/* Identity Card Skeleton */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 w-full max-w-sm flex flex-col items-center sm:items-start">
                    <div className="h-6 w-48 bg-gray-200 rounded-md" />
                    <div className="h-4 w-64 bg-gray-200 rounded-md" />
                </div>
            </div>

            {/* Grid Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-20 bg-gray-50 border border-gray-100 rounded-2xl" />
                ))}
            </div>

            {/* Action Trigger Skeleton */}
            <div className="pt-6 sm:pt-8 border-t border-gray-100 mt-6 sm:mt-8">
                <div className="h-11 w-full sm:w-36 bg-gray-200 rounded-xl" />
            </div>
        </div>
    );
}