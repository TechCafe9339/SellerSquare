"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  AlignLeft,
  ImagePlus,
  X,
  Store,
} from "lucide-react";
import api from "@/lib/api";

// /seller/profile is a combined record shared with the Profile page
// (business_name, owner_name, email, phone, gst_number, etc). This
// section only edits the storefront-facing fields below, but must
// fetch and resend the full object so it never overwrites fields it
// doesn't own.
interface StoreProfile {
  store_address: string;
  store_description: string;
  logo_url: string;
  [key: string]: unknown;
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Settings</h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Manage your account security and storefront details.
      </p>

      <div className="mt-6 space-y-6">
        <StoreProfileSection />
        <ChangePasswordSection />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Store profile                                                     */
/* ---------------------------------------------------------------- */

function StoreProfileSection() {
  const [profile, setProfile] = useState<StoreProfile>({
    store_address: "",
    store_description: "",
    logo_url: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fetchProfile = async () => {
    setLoadState("loading");
    try {
      const res = await api.get("/seller/profile");
      // Keep the full response (business_name, owner_name, email, etc.)
      // so saving later doesn't drop fields this section doesn't show.
      setProfile({
        ...res.data,
        store_address: res.data.store_address || "",
        store_description: res.data.store_description || "",
        logo_url: res.data.logo_url || "",
      });
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setLogoFile(file);
  };

  const clearLogo = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    const response = await api.post("/seller/upload", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.image_url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      let logoUrl = profile.logo_url;

      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile);
        } catch {
          setError("We couldn't upload the logo. You can try again or save without changing it.");
          setSaving(false);
          return;
        }
      }

      // payload includes the full profile object (business_name, owner_name,
      // email, phone, gst_number, etc.) plus this section's edited fields,
      // so saving here can't wipe out data the Profile page owns.
      const payload = { ...profile, logo_url: logoUrl };
      await api.put("/seller/profile", payload);
      setProfile(payload);
      clearLogo();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "We couldn't save your storefront details. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
        <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-6 space-y-4">
          <div className="h-20 w-20 animate-pulse rounded-lg bg-black/5" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
          <div className="h-20 w-full animate-pulse rounded-lg bg-black/5" />
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center sm:p-8">
        <p className="text-sm font-medium text-[#0B0F19]">Couldn&apos;t load storefront details</p>
        <button
          onClick={fetchProfile}
          className="mt-3 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="text-base font-semibold tracking-tight text-[#0B0F19]">
        Store profile
      </h2>
      <p className="mt-0.5 text-sm text-[#6B7280]">
        This is what customers see on your storefront.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
            Store logo
          </label>

          {preview || profile.logo_url ? (
            <div className="relative h-20 w-20">
              <Image
                src={preview || profile.logo_url}
                alt="Store logo"
                fill
                className="rounded-lg border border-black/10 object-cover"
                sizes="80px"
              />
              <button
                type="button"
                onClick={clearLogo}
                aria-label="Remove logo"
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0B0F19] text-white shadow-sm hover:bg-[#0B0F19]/90"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="logo-upload"
              className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/20 text-[#6B7280] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              <Store size={18} />
              <span className="text-[10px] font-medium">Upload</span>
            </label>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoSelect}
            className="hidden"
            id="logo-upload"
          />
        </div>

        <div>
          <label htmlFor="store_address" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
            Store address
          </label>
          <div className="relative">
            <MapPin size={17} className="absolute left-3 top-3.5 text-[#6B7280]" />
            <textarea
              id="store_address"
              name="store_address"
              rows={2}
              placeholder="Where customers can reach your store"
              value={profile.store_address}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="store_description" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
            Store description
          </label>
          <div className="relative">
            <AlignLeft size={17} className="absolute left-3 top-3.5 text-[#6B7280]" />
            <textarea
              id="store_description"
              name="store_description"
              rows={4}
              placeholder="Tell customers what your store is about"
              value={profile.store_description}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>Store profile updated.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving…" : "Save store profile"}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Change password                                                   */
/* ---------------------------------------------------------------- */

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!currentPassword) return "Enter your current password.";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (newPassword === currentPassword) {
      return "New password must be different from your current password.";
    }
    if (newPassword !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.put("/seller/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "We couldn't change your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[#0B0F19]">
            Change password
          </h2>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            Use at least 8 characters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
        >
          {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPasswords ? "Hide" : "Show"} passwords
        </button>
      </div>

      <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
        <PasswordField
          id="current_password"
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showPasswords}
          autoComplete="current-password"
        />
        <PasswordField
          id="new_password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showPasswords}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm_password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showPasswords}
          autoComplete="new-password"
        />

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            <span>Password changed successfully.</span>
          </div>
        )}

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Updating…" : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
        {label}
      </label>
      <div className="relative">
        <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
    </div>
  );
}