"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import api from "@/lib/api";

interface SellerProfile {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  gst_number: string;
}

const INITIAL_PROFILE: SellerProfile = {
  business_name: "",
  owner_name: "",
  email: "",
  phone: "",
  gst_number: "",
};

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

type LoadState = "loading" | "error" | "ready";

export default function ProfilePage() {
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<SellerProfile>(INITIAL_PROFILE);
  const [draft, setDraft] = useState<SellerProfile>(INITIAL_PROFILE);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setState("loading");
    try {
      const res = await api.get("/seller/profile");
      setProfile(res.data);
      setDraft(res.data);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!draft.business_name.trim()) return "Business name is required.";
    if (!draft.owner_name.trim()) return "Owner name is required.";
    if (!PHONE_REGEX.test(draft.phone)) return "Enter a valid 10-digit phone number.";
    if (!GST_REGEX.test(draft.gst_number.toUpperCase())) {
      return "Enter a valid 15-character GST number.";
    }
    return null;
  };

  const startEditing = () => {
    setDraft(profile);
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setError("");
    setEditing(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...draft, gst_number: draft.gst_number.toUpperCase() };
      await api.put("/seller/profile", payload);
      setProfile(payload);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "We couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="max-w-2xl">
        <div className="h-7 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-black/5" />
            <div className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-28 animate-pulse rounded bg-black/5" />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Profile</h1>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-medium text-[#0B0F19]">Couldn&apos;t load your profile</p>
            <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
          </div>
          <button
            onClick={fetchProfile}
            className="mt-2 rounded-lg bg-[#0B0F19] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const initials = (profile.business_name || profile.owner_name || "S")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Profile</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <CheckCircle2 size={15} />
            Saved
          </span>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
        {/* Identity header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#0B0F19] text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[#0B0F19]">
                {profile.business_name || "Your business"}
              </div>
              <div className="text-sm text-[#6B7280]">{profile.owner_name}</div>
            </div>
          </div>

          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-[#0B0F19] transition-colors hover:bg-black/5"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
        </div>

        {/* Details */}
        <form onSubmit={handleUpdate} className="mt-8 space-y-4">
          <Field
            icon={Building2}
            name="business_name"
            label="Business name"
            value={editing ? draft.business_name : profile.business_name}
            onChange={handleChange}
            disabled={!editing}
          />

          <Field
            icon={User}
            name="owner_name"
            label="Owner name"
            value={editing ? draft.owner_name : profile.owner_name}
            onChange={handleChange}
            disabled={!editing}
          />

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
              Email
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                id="email"
                value={profile.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-black/10 bg-black/[0.03] py-2.5 pl-10 pr-3 text-sm text-[#6B7280]"
              />
            </div>
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Contact support to change the email on your account.
            </p>
          </div>

          <Field
            icon={Phone}
            name="phone"
            label="Phone number"
            value={editing ? draft.phone : profile.phone}
            onChange={handleChange}
            disabled={!editing}
            inputMode="numeric"
            maxLength={10}
          />

          <Field
            icon={FileText}
            name="gst_number"
            label="GST number"
            value={editing ? draft.gst_number : profile.gst_number}
            onChange={handleChange}
            disabled={!editing}
            maxLength={15}
            className="uppercase"
          />

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {editing && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  name,
  label,
  value,
  onChange,
  disabled,
  inputMode,
  maxLength,
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  className?: string;
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
          value={value}
          onChange={onChange}
          disabled={disabled}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition-colors ${
            disabled
              ? "cursor-not-allowed border-black/10 bg-black/[0.03] text-[#6B7280]"
              : "border-black/10 bg-white text-[#0B0F19] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          } ${className}`}
        />
      </div>
    </div>
  );
}