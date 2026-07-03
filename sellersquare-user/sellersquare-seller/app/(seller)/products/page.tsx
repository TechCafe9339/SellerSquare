"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  PackageX,
  ImageOff,
  Loader2,
  Search,
  X,
} from "lucide-react";
import api from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  image_url: string;
  status: "active" | "inactive";
}

type LoadState = "loading" | "error" | "ready";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setState("loading");
    try {
      const res = await api.get("/seller/products");
      setProducts(res.data);
      setState("ready");
    } catch (error) {
      setState("error");
    }
  };

  const deleteProduct = async (productId: string) => {
    setDeletingId(productId);
    try {
      await api.delete(`/seller/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      // Keep the row in place and let the user retry rather than
      // silently failing.
      alert("Couldn't delete this product. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const toggleStatus = async (productId: string) => {
    const previous = products;
    setTogglingId(productId);

    // Flip locally first so the badge responds immediately; roll back
    // just this row if the request fails.
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );

    try {
      await api.put(`/seller/products/${productId}/status`);
    } catch (error) {
      setProducts(previous);
      alert("Couldn't update product status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasNoSearchResults =
    state === "ready" && products.length > 0 && filteredProducts.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {state === "ready" &&
              `${products.length} product${products.length === 1 ? "" : "s"} in your catalog.`}
            {state === "loading" && "Loading your catalog…"}
            {state === "error" && "We couldn't load your catalog."}
          </p>
        </div>

        <Link
          href="/products/add"
          className="flex items-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {state === "ready" && products.length > 0 && (
        <div className="relative mb-4 mt-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search products…"
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
              <p className="font-medium text-[#0B0F19]">
                Couldn&apos;t load your products
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Check your connection and try again.
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              Try again
            </button>
          </div>
        )}

        {state === "ready" && products.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#6B7280]">
              <PackageX size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">No products yet</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Add your first product to start selling.
              </p>
            </div>
            <Link
              href="/products/add"
              className="mt-2 flex items-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
            >
              <Plus size={16} />
              Add product
            </Link>
          </div>
        )}

        {hasNoSearchResults && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-[#6B7280]">
              <Search size={20} />
            </div>
            <div>
              <p className="font-medium text-[#0B0F19]">No matches for &ldquo;{search}&rdquo;</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Try a different search term.
              </p>
            </div>
            <button
              onClick={() => setSearch("")}
              className="mt-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
            >
              Clear search
            </button>
          </div>
        )}

        {state === "ready" && filteredProducts.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <table className="w-full">
              <thead className="border-b border-black/10 bg-black/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Product
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Price
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Category
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-black/[0.015]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/5">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-[#0B0F19]">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-sm text-[#0B0F19]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-3">
                      <StockBadge stock={product.stock} />
                    </td>

                    <td className="px-5 py-3 text-sm text-[#6B7280]">
                      {product.category}
                    </td>

                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleStatus(product.id)}
                        disabled={togglingId === product.id}
                        title="Click to toggle"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-60 ${product.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-black/5 text-[#6B7280]"
                          }`}
                      >
                        {togglingId === product.id && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        {product.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/edit/${product.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>

                        {confirmId === product.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => deleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                            >
                              {deletingId === product.id ? (
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
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(product.id)}
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

function StockBadge({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "bg-red-50 text-red-700"
      : stock <= 10
        ? "bg-amber-50 text-amber-700"
        : "bg-green-50 text-green-700";

  const label = stock === 0 ? "Out of stock" : `${stock} in stock`;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      {label}
    </span>
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
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-lg bg-black/5" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded bg-black/5" />
            </div>
            <div className="h-3.5 w-16 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}