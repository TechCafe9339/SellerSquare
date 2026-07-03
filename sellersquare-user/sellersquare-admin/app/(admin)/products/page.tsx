"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  PackageX,
  Search,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  seller: string;
}

type LoadState = "loading" | "error" | "ready";

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setState("loading");
    try {
      const res = await api.get("/admin/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const deleteProduct = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product removed.", { variant: "default" });
    } catch {
      showToast("Couldn't remove this product. Please try again.", { variant: "error" });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasNoSearchResults =
    state === "ready" && products.length > 0 && filteredProducts.length === 0;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Products</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {state === "ready" &&
            `${products.length} product${products.length === 1 ? "" : "s"} across the marketplace.`}
          {state === "loading" && "Loading products…"}
          {state === "error" && "We couldn't load products."}
        </p>
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
              <p className="font-medium text-[#0B0F19]">Couldn&apos;t load products</p>
              <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
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
            <p className="font-medium text-[#0B0F19]">No products yet</p>
            <p className="text-sm text-[#6B7280]">
              Products will show up here once sellers start listing.
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

        {state === "ready" && filteredProducts.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <table className="w-full">
              <thead className="border-b border-black/10 bg-black/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Product
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Seller
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Price
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-black/[0.015]">
                    <td className="px-5 py-3 text-sm font-medium text-[#0B0F19]">
                      {product.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{product.seller}</td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{product.category}</td>
                    <td className="px-5 py-3 text-sm text-[#0B0F19]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#6B7280]">{product.stock}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {confirmId === product.id ? (
                          <>
                            <span className="text-xs text-[#6B7280]">Remove this listing?</span>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmId(product.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Remove
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
            <div className="h-3.5 w-20 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-black/5" />
            <div className="h-3.5 w-12 animate-pulse rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}