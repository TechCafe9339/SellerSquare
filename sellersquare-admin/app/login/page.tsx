"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretPin, setSecretPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // checkingSession: true while we decide whether an existing token
  // should redirect straight to the dashboard. Keeps the login form
  // from flashing on screen for already-authenticated admins.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.push("/dashboard");
      // Deliberately not setting checkingSession to false here — we
      // want to keep showing the blank/loading state until the redirect
      // actually takes over, rather than flash the form first.
      return;
    }
    setCheckingSession(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !secretPin) {
      setError("Enter your email, password, and secret PIN to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/admin/login", {
        email,
        password,
        secret_pin: secretPin,
      });

      localStorage.setItem("admin_token", res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "We couldn't log you in. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-[#FAFAF8]" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B0F19]">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#0B0F19]">
            SellerSquare
            <span className="ml-1.5 font-normal text-[#6B7280]">Admin</span>
          </span>
        </Link>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-[#0B0F19]">
            Admin login
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Sign in with your administrator credentials.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@sellersquare.com"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="secret_pin" className="mb-1.5 block text-sm font-medium text-[#0B0F19]">
                Secret PIN
              </label>
              <div className="relative">
                <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                <input
                  id="secret_pin"
                  type="password"
                  autoComplete="off"
                  inputMode="numeric"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  placeholder="Your personal secret PIN"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <p className="mt-1.5 text-xs text-[#6B7280]">
                The personal PIN you were given when your account was created.
              </p>
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
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          Admin access is invite-only. Contact your marketplace owner if you need an account.
        </p>
      </div>
    </div>
  );
}