"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditAddressPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (params?.id) {
      fetchAddress();
    }
  }, [params?.id]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/address/${params.id}`);
      
      if (res.data) {
        setFormData({
          full_name: res.data.full_name ?? "",
          phone: res.data.phone ?? "",
          address: res.data.address ?? "",
          city: res.data.city ?? "",
          state: res.data.state ?? "",
          pincode: res.data.pincode ?? "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load address data");
      router.push("/address");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Standardized sanitization rules matching the main address channel
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }
    if (name === "pincode") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, "").slice(0, 6) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (formData.pincode.length < 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/address/${params.id}`, formData);
      toast.success("Address updated successfully");
      router.push("/address");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-gray-900">
      {/* Return navigation link contextual node */}
      <Link
        href="/address"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition mb-4 group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Addresses
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 sm:mb-8 text-gray-900">
        Edit Address
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm"
      >
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Person</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Mobile Connectivity</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-Digit Phone Number"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm font-mono"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Street Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Flat, House no., Building, Apartment, Street"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm resize-none"
            rows={3}
            required
          />
        </div>

        {/* Regional Multi-Column Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Pincode / Postal Code</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="6-Digit Pincode"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm font-mono"
            required
          />
        </div>

        {/* Action Controls Array Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/address"
            className="w-full sm:w-auto text-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}