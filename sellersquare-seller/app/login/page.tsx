"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Store, Mail, Lock, Loader2, AlertCircle, Package, ShoppingBag, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SellerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post("/seller/login", { email, password });
      localStorage.setItem("seller_token", res.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "We couldn't log you in. Check your email and password and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B0F19]">
              <Store size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#0B0F19]">
              SellerSquare
              <span className="ml-1.5 font-normal text-[#6B7280]">Seller</span>
            </span>
          </Link>

          <h1 className="mt-10 text-2xl font-bold tracking-tight text-[#0B0F19]">
            Log in to your store
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Manage products, orders, and revenue from your dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#0B0F19]"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@store.com"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none ring-0 transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0B0F19]"
                >
                  Password
                </label>
                <Link
                  href="/seller/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none ring-0 transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6B7280]">
            New to SellerSquare?{" "}
            <Link
              href="/register"
              className="font-medium text-[#2563EB] hover:underline"
            >
              Create a seller account
            </Link>
          </p>
        </div>
      </div>

      {/* Right: animated panel */}
      <div className="relative hidden overflow-hidden bg-[#0B0F19] lg:block">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl" />

        {/* Faint grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-tight text-white">
              Every order, moving in one direction: forward.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              Track listings, fulfillment, and revenue in real time as orders
              flow through your store.
            </p>
          </div>

          {/* Animated order-flow lane */}
          <div className="relative h-80 w-full" aria-hidden>
            {/* vertical guide lines */}
            <div className="absolute inset-0 flex justify-between px-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-full w-px bg-gradient-to-t from-white/0 via-white/15 to-white/0"
                />
              ))}
            </div>

            <FlowCard
              icon={Package}
              label="New listing"
              sub="Wireless Earbuds"
              lane={0}
              delay="0s"
            />
            <FlowCard
              icon={ShoppingBag}
              label="Order placed"
              sub="#SS-48213"
              lane={1}
              delay="2.4s"
            />
            <FlowCard
              icon={TrendingUp}
              label="Revenue up"
              sub="+12% this week"
              lane={2}
              delay="4.8s"
            />
          </div>

          <p className="text-xs text-white/40">
            Trusted by 12,000+ sellers across India
          </p>
        </div>
      </div>
    </div>
  );
}

function FlowCard({
  icon: Icon,
  label,
  sub,
  lane,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  sub: string;
  lane: number;
  delay: string;
}) {
  const laneOffsets = ["6%", "38%", "70%"];

  return (
    <div
      className="absolute flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm motion-safe:animate-flow-up"
      style={{
        left: laneOffsets[lane],
        animationDelay: delay,
      }}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/20 text-[#60A5FA]">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-xs font-medium text-white">{label}</div>
        <div className="text-[11px] text-white/50">{sub}</div>
      </div>
    </div>
  );
}