"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Trash2, Plus, MapPin, Loader2, Pencil, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingDefaultId, setUpdatingDefaultId] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
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
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }
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
        is_default: false,
      });

      const res = await api.get("/address/");
      setAddresses(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setUpdatingDefaultId(addressId);
      await api.put(`/address/default/${addressId}`);
      toast.success("Default address updated");
      
      // Optimistically switch client states
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update default address");
    } finally {
      setUpdatingDefaultId(null);
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
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          My Addresses
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your saved delivery locations and primary shipping targets.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form Wrapper Panel */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Add New Address
            </h2>
          </div>

          <form onSubmit={addAddress} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Contact Details</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              />
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-Digit Mobile Number"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Location Mapping</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Flat, House no., Building, Apartment"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
                />
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
                />
              </div>

              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-Digit Pincode"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition shadow-sm"
              />
            </div>

            {/* Checkbox module wrapper layout */}
            <div className="pt-2 flex items-center">
              <label className="relative flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium text-gray-600">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={form.is_default}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border border-gray-300 rounded-md bg-white flex items-center justify-center peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition shadow-sm">
                  <Check className="h-3.5 w-3.5 text-white stroke-[3px] opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                Set as default delivery address
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition disabled:opacity-50 disabled:pointer-events-none shadow-sm mt-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Address
            </button>
          </form>
        </div>

        {/* Main Dynamic List Column Container */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Saved Addresses
          </h2>

          {loading ? (
            <AddressListSkeleton />
          ) : addresses.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-400">
                <MapPin className="h-[22px] w-[22px]" />
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
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    item.is_default ? "border-indigo-200 ring-1 ring-indigo-100" : "border-gray-200"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                        {item.full_name}
                      </h3>
                      {item.is_default && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60 shadow-sm animate-fade-in">
                          Default Address
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Mobile: <span className="text-gray-700 font-mono">{item.phone}</span>
                    </p>

                    <div className="pt-1 text-sm font-medium text-gray-600 space-y-0.5 leading-relaxed">
                      <p className="break-words text-gray-700">{item.address}</p>
                      <p className="text-gray-600">
                        {item.city}, {item.state} — <span className="font-semibold tracking-wide text-gray-800 font-mono">{item.pincode}</span>
                      </p>
                    </div>

                    {/* Set Default operational trigger block */}
                    {!item.is_default && (
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={updatingDefaultId !== null}
                          onClick={() => handleSetDefault(item.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition p-0 bg-transparent border-0 cursor-pointer"
                        >
                          {updatingDefaultId === item.id ? "Updating..." : "Make primary address"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Group toolbar */}
                  <div className="flex items-center sm:self-start gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 w-full sm:w-auto justify-end shrink-0">
                    <Link
                      href={`/address/edit/${item.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition shadow-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteAddress(item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Remove delivery address entry"
                      className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition shrink-0 active:scale-95 disabled:opacity-40"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="h-5 w-32 bg-gray-200 rounded-md" />
              <div className="h-5 w-12 bg-gray-200 rounded-md" />
            </div>
            <div className="h-7 w-16 bg-gray-200 rounded-md" />
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