"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import api from "@/lib/api";

type Step = "email" | "otp";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/seller/send-otp", { email });
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "We couldn't send an OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/seller/verify-otp", {
        email,
        otp,
        new_password: newPassword,
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1400);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("/seller/send-otp", { email });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "We couldn't resend the OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B0F19]">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#0B0F19]">
            SellerSquare
            <span className="ml-1.5 font-normal text-[#6B7280]">Seller</span>
          </span>
        </Link>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-[#0B0F19]">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {step === "email"
              ? "Enter your email to receive a one-time code."
              : `Enter the code sent to ${email}.`}
          </p>

          {success ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Password updated.</p>
                <p className="mt-0.5 text-green-700">Taking you to log in…</p>
              </div>
            </div>
          ) : step === "email" ? (
            <form onSubmit={sendOtp} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
                  Email
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@store.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
                  One-time code
                </label>
                <div className="relative">
                  <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm tracking-widest text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] placeholder:tracking-normal focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="mt-1.5 text-xs font-medium text-[#2563EB] hover:underline disabled:opacity-60"
                >
                  Resend code
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0B0F19]">New password</span>
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
                >
                  {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPasswords ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    id="confirm"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Verifying…" : "Reset password"}
              </button>

              <button
                type="button"
                onClick={backToEmail}
                className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </form>
          )}

          {!success && step === "email" && (
            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0B0F19]"
            >
              <ArrowLeft size={14} />
              Back to log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}