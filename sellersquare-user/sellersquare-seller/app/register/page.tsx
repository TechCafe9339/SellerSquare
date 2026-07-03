"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";

type FormData = {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  gst_number: string;
  password: string;
  confirmPassword: string;
};

const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function SellerRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    gst_number: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = (): string | null => {
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!PHONE_REGEX.test(formData.phone)) {
      return "Enter a valid 10-digit phone number.";
    }
    if (!GST_REGEX.test(formData.gst_number.toUpperCase())) {
      return "Enter a valid 15-character GST number.";
    }
    return null;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await api.post("/seller/register", {
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        email: formData.email,
        phone: formData.phone,
        gst_number: formData.gst_number.toUpperCase(),
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1400);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "We couldn't create your account. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
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
            Create your seller account
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Tell us about your business to start listing products.
          </p>

          {success ? (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Account created.</p>
                <p className="mt-0.5 text-green-700">
                  Taking you to log in…
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="mt-8 space-y-4" noValidate>
              <Field
                icon={Building2}
                name="business_name"
                label="Business name"
                placeholder="Acme Retail Pvt. Ltd."
                value={formData.business_name}
                onChange={handleChange}
              />

              <Field
                icon={User}
                name="owner_name"
                label="Owner name"
                placeholder="Full name"
                value={formData.owner_name}
                onChange={handleChange}
              />

              <Field
                icon={Mail}
                name="email"
                label="Email"
                type="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <Field
                icon={Phone}
                name="phone"
                label="Phone number"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
              />

              <Field
                icon={FileText}
                name="gst_number"
                label="GST number"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gst_number}
                onChange={handleChange}
                maxLength={15}
                className="uppercase"
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  icon={Lock}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <Field
                  icon={Lock}
                  name="confirmPassword"
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
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
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F19]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#2563EB] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: animated panel */}
      <div className="relative hidden overflow-hidden bg-[#0B0F19] lg:block">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#2563EB]/10 blur-3xl" />

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
              Set up once. Sell on every channel.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              A few details now save you hours later — your catalog,
              orders, and payouts all run through one account.
            </p>
          </div>

          <div className="relative h-80 w-full" aria-hidden>
            <div className="absolute inset-0 flex justify-between px-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-full w-px bg-gradient-to-t from-white/0 via-white/15 to-white/0"
                />
              ))}
            </div>

            <FlowCard icon={Package} label="New listing" sub="Wireless Earbuds" lane={0} delay="0s" />
            <FlowCard icon={ShoppingBag} label="Order placed" sub="#SS-48213" lane={1} delay="2.4s" />
            <FlowCard icon={TrendingUp} label="Revenue up" sub="+12% this week" lane={2} delay="4.8s" />
          </div>

          <p className="text-xs text-white/40">
            Trusted by 12,000+ sellers across India
          </p>
        </div>
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
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "email";
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
          type={type}
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`w-full rounded-lg border border-black/10 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0B0F19] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 ${className}`}
        />
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