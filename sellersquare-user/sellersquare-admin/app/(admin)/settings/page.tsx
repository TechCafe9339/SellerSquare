"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";

interface AdminProfile {
  email: string;
  role: string;
}

type LoadState = "loading" | "error" | "ready";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Settings</h1>
      <p className="mt-1 text-sm text-[#6B7280]">
        Manage your admin account.
      </p>

      <div className="mt-6 space-y-6">
        <ProfileSection />
        <ChangePasswordSection />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Admin profile (read-only)                                         */
/* ---------------------------------------------------------------- */

function ProfileSection() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setState("loading");
    try {
      const res = await api.get("/admin/profile");
      setProfile({
        email: res.data?.email ?? "",
        role: res.data?.role ?? "",
      });
      setState("ready");
    } catch {
      setState("error");
    }
  };

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
        <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-6 space-y-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-black/5" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-center sm:p-8">
        <p className="text-sm font-medium text-[#0B0F19]">Couldn&apos;t load your profile</p>
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
        Admin profile
      </h2>
      <p className="mt-0.5 text-sm text-[#6B7280]">
        Your account details.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0B0F19]">Email</label>
          <div className="relative">
            <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <div className="w-full rounded-lg border border-black/10 bg-black/[0.03] py-2.5 pl-10 pr-3 text-sm text-[#6B7280]">
              {profile?.email || "—"}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0B0F19]">Role</label>
          <div className="relative">
            <ShieldCheck size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <div className="w-full rounded-lg border border-black/10 bg-black/[0.03] py-2.5 pl-10 pr-3 text-sm capitalize text-[#6B7280]">
              {profile?.role || "—"}
            </div>
          </div>
        </div>
      </div>
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
      await api.put("/admin/change-password", {
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