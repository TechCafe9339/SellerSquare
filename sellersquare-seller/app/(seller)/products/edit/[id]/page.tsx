"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  AlignLeft,
  IndianRupee,
  Boxes,
  Layers,
  BadgeCheck,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import api from "@/lib/api";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
}

type LoadState = "loading" | "error" | "ready";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [state, setState] = useState<LoadState>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
  });

  // existingImageUrl: the image already saved on the product.
  // newImageFile / preview: a locally selected replacement, not yet uploaded.
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fetchProduct = async () => {
    setState("loading");
    try {
      const res = await api.get(`/seller/products/${id}`);
      setFormData({
        name: res.data.name || "",
        description: res.data.description || "",
        price: res.data.price?.toString() || "",
        stock: res.data.stock?.toString() || "",
        category: res.data.category || "",
        brand: res.data.brand || "",
      });
      setExistingImageUrl(res.data.image_url || "");
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setNewImageFile(file);
  };

  const clearNewImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setNewImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = () => {
    setExistingImageUrl("");
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return "Product name is required.";
    const price = Number(formData.price);
    const stock = Number(formData.stock);
    if (!formData.price || price <= 0) return "Enter a price greater than 0.";
    if (!formData.stock || stock < 0 || !Number.isInteger(stock)) {
      return "Enter a valid stock quantity (0 or more).";
    }
    return null;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    const response = await api.post("/seller/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.image_url;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = existingImageUrl;

      if (newImageFile) {
        try {
          imageUrl = await uploadImage(newImageFile);
        } catch {
          setError("We couldn't upload the new image. You can try again or keep the existing one.");
          setSubmitting(false);
          return;
        }
      }

      await api.put(`/seller/products/${id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        image_url: imageUrl,
      });

      router.push("/products");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "We couldn't update this product. Check the details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="max-w-3xl">
        <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-7 w-48 animate-pulse rounded bg-black/5" />
        <div className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
          ))}
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-3xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
        >
          <ArrowLeft size={15} />
          Back to products
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-medium text-[#0B0F19]">Couldn&apos;t load this product</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              It may have been removed, or there's a connection issue.
            </p>
          </div>
          <button
            onClick={fetchProduct}
            className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
      >
        <ArrowLeft size={15} />
        Back to products
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0B0F19]">
        Edit product
      </h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Update the details below and save your changes.
      </p>

      <form
        onSubmit={handleUpdate}
        className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8"
      >
        <Field
          icon={Tag}
          name="name"
          label="Product name"
          placeholder="e.g. Wireless Earbuds Pro"
          value={formData.name}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
            Description
          </label>
          <div className="relative">
            <AlignLeft size={17} className="absolute left-3 top-3.5 text-[#6B7280]" />
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="What makes this product worth buying?"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full resize-none rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            icon={IndianRupee}
            name="price"
            label="Price"
            type="number"
            placeholder="0"
            value={formData.price}
            onChange={handleChange}
            min={1}
            step="0.01"
          />
          <Field
            icon={Boxes}
            name="stock"
            label="Stock quantity"
            type="number"
            placeholder="0"
            value={formData.stock}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            icon={Layers}
            name="category"
            label="Category"
            placeholder="e.g. Electronics"
            value={formData.category}
            onChange={handleChange}
          />
          <Field
            icon={BadgeCheck}
            name="brand"
            label="Brand"
            placeholder="e.g. Acme"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
            Product image
          </label>

          {preview ? (
            <ImageSlot src={preview} alt="New image preview" onRemove={clearNewImage} />
          ) : existingImageUrl ? (
            <ImageSlot src={existingImageUrl} alt={formData.name} onRemove={removeExistingImage} />
          ) : (
            <UploadSlot fileInputRef={fileInputRef} onSelect={handleImageSelect} />
          )}

          {(preview || existingImageUrl) && (
            <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline">
              <ImagePlus size={13} />
              {existingImageUrl && !preview ? "Replace image" : "Choose a different image"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Saving…" : "Save changes"}
          </button>
          <Link
            href="/products"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-black/5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function ImageSlot({
  src,
  alt,
  onRemove,
}: {
  src: string;
  alt: string;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-32 w-32">
      <Image src={src} alt={alt} fill className="rounded-lg object-cover" sizes="128px" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0B0F19] text-white shadow-sm transition-colors hover:bg-[#0B0F19]/90"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function UploadSlot({
  fileInputRef,
  onSelect,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/20 text-[#6B7280] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]">
      <ImagePlus size={20} />
      <span className="text-xs font-medium">Upload</span>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelect} className="hidden" />
    </label>
  );
}

function Field({
  icon: Icon,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
        {label}
      </label>
      <div className="relative">
        <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          id={name}
          name={name}
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
    </div>
  );
}