"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trash2, Plus, MapPin, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Address {
    id: string;
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export default function AddressPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const res = await api.get("/address/");
            setAddresses(res.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Strict input filters for number strings
        if (name === "phone") {
            setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 10) }));
            return;
        }
        if (name === "pincode") {
            setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 6) }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.phone.length < 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }
        if (form.pincode.length < 6) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("/address/add", form);
            toast.success("Address added successfully");
            
            setForm({
                full_name: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
            });
            
            // Fast refetch after operation closure
            const res = await api.get("/address/");
            setAddresses(res.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add address");
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteAddress = async (addressId: string) => {
        try {
            setDeletingId(addressId);
            await api.delete(`/address/remove/${addressId}`);
            toast.success("Address removed");
            setAddresses((prev) => prev.filter((item) => item.id !== addressId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove address");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 sm:mb-8 text-gray-900">
                My Addresses
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Form Wrapper Panel */}
                <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Plus size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                            Add New Address
                        </h2>
                    </div>

                    <form onSubmit={addAddress} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact Details</label>
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                            />
                        </div>

                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="10-Digit Mobile Number"
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        />

                        <div className="space-y-1 pt-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Location Mapping</label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Flat, House no., Building, Company, Apartment"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Inline Multi-column regional layout block */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="City"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                            />

                            <input
                                type="text"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                placeholder="State"
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                            />
                        </div>

                        <input
                            type="text"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            placeholder="6-Digit Pincode"
                            required
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-100"
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin mr-2" />
                            ) : null}
                            Save Address
                        </button>
                    </form>
                </div>

                {/* Main Dynamic List Column Container */}
                <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-1">
                        Saved Addresses
                    </h2>

                    {loading ? (
                        <AddressListSkeleton />
                    ) : addresses.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <MapPin size={22} />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                No delivery addresses linked to this profile yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-gray-200/80 transition flex items-start justify-between gap-4"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                                            <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                                                {item.full_name}
                                            </h3>
                                            <span className="text-xs bg-slate-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">Home</span>
                                        </div>
                                        
                                        <p className="text-xs sm:text-sm font-semibold text-gray-500">
                                            Mobile: {item.phone}
                                        </p>

                                        <div className="pt-1.5 text-sm font-medium text-gray-600 space-y-0.5 leading-relaxed">
                                            <p className="break-words text-gray-700">{item.address}</p>
                                            <p className="text-gray-600">
                                                {item.city}, {item.state} — <span className="font-bold tracking-wide text-gray-800">{item.pincode}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteAddress(item.id)}
                                        disabled={deletingId === item.id}
                                        aria-label="Remove delivery address entry"
                                        className="text-gray-400 hover:text-rose-600 hover:bg-rose-50/50 p-2 rounded-xl transition shrink-0 active:scale-95 disabled:opacity-40"
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 size={18} className="animate-spin text-rose-600" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function AddressListSkeleton() {
    return (
        <div className="space-y-4 w-full">
            {[...Array(2)].map((_, idx) => (
                <div key={idx} className="bg-gray-50/60 border border-gray-100 rounded-2xl p-5 space-y-3 animate-pulse">
                    <div className="flex gap-2">
                        <div className="h-5 w-32 bg-gray-200 rounded-md" />
                        <div className="h-5 w-12 bg-gray-200 rounded-md" />
                    </div>
                    <div className="h-4 w-40 bg-gray-200 rounded-md" />
                    <div className="space-y-1.5 pt-1">
                        <div className="h-4 w-full bg-gray-200 rounded-md" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    );
}