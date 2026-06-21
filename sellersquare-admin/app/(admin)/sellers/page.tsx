"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Users,
  Search,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Seller {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  is_active: boolean;
}

type LoadState = "loading" | "error" | "ready";

export default function SellersPage() {
  const { showToast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setState("loading");
    try {
      const res = await api.get("/admin/sellers");
      setSellers(Array.isArray(res.data) ? res.data : []);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const toggleSeller = async (id: string) => {
    const previous = sellers;
    setTogglingId(id);

    // Flip locally first; this is reversible (just toggle again), so an
    // immediate optimistic update is fine, with rollback on failure.
    setSellers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );

    try {
      await api.put(`/admin/sellers/${id}/toggle`);
    } catch {
      setSellers(previous);
      showToast("Couldn't update this seller. Please try again.", { variant: "error" });
    } finally {
      setTogglingId(null);
    }
  };

  const deleteSeller = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/sellers/${id}`);
      setSellers((prev) => prev.filter((s) => s.id !== id));
      showToast("Seller account removed.", { variant: "default" });
    } catch {
      showToast("Couldn't remove this seller. Please try again.", { variant: "error" });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const filteredSellers = sellers.filter((seller) =>
    seller.business_name.toLowerCase().includes(search.toLowerCase())
  );

  const hasNoSearchResults =
    state === "ready" && sellers.length > 0 && filteredSellers.length === 0;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Sellers</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {state === "ready" &&
            `${sellers.length} seller${sellers.length === 1 ? "" : "s"} on the marketplace.`}
          {state === "loading" && "Loading sellers…"}
          {state === "error" && "We couldn't load sellers."}
        </p>
      </div>

      {state === "ready" && sellers.length > 0 && (
        <div className="relative mb-4 mt-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search sellers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-9 pr-9 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0F19]"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        {state === "loading" && <TableSkeleton />}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">Couldn&apos;t load sellers</p>
              <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
            </div>
            <button
              onClick={fetchSellers}
              className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && sellers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#6B7280]">
              <Users size={20} />
            </div>
            <p className="font-medium text-[#0B0F19]">No sellers yet</p>
            <p className="text-sm text-[#6B7280]">
              Approved sellers will show up here.
            </p>
          </div>
        )}

        {hasNoSearchResults && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#6B7280]">
              <Search size={20} />
            </div>
            <p className="font-medium text-[#0B0F19]">No matches for &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="mt-1 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
            >
              Clear search
            </button>
          </div>
        )}

        {state === "ready" && filteredSellers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <table className="w-full">
              <thead className="border-b border-black/10 bg-black/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Business
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Owner
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="transition-colors hover:bg-black/[0.015]">
                    <td className="px-5 py-3 text-sm font-medium text-[#0B0F19]">
                      {seller.business_name}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{seller.owner_name}</td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{seller.email}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleSeller(seller.id)}
                        disabled={togglingId === seller.id}
                        title="Click to toggle"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-60 ${
                          seller.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {togglingId === seller.id && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        {seller.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {confirmId === seller.id ? (
                          <>
                            <span className="text-xs text-[#6B7280]">
                              Delete this seller&apos;s account?
                            </span>
                            <button
                              onClick={() => deleteSeller(seller.id)}
                              disabled={deletingId === seller.id}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                            >
                              {deletingId === seller.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-black/5"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmId(seller.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-black/[0.02] px-5 py-3">
        <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-40 animate-pulse rounded bg-black/5" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}