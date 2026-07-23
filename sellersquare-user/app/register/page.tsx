"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces, Manrope } from "next/font/google";
import {
  Apple,
  Carrot,
  Eye,
  EyeOff,
  Loader2,
  Milk,
  ShoppingBasket,
  Wheat,
} from "lucide-react";
import api from "@/lib/api";

// Same type pairing as the login page — an editorial serif for the brand
// voice, a warm geometric sans for everything the person reads or types.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const AISLE_ICONS = [
  { Icon: ShoppingBasket, top: "8%", left: "72%", size: 46, rotate: -8 },
  { Icon: Apple, top: "22%", left: "18%", size: 30, rotate: 6 },
  { Icon: Carrot, top: "58%", left: "10%", size: 34, rotate: -14 },
  { Icon: Milk, top: "68%", left: "80%", size: 32, rotate: 10 },
  { Icon: Wheat, top: "40%", left: "85%", size: 28, rotate: -4 },
];

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the field error as the user corrects it
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!formData.name.trim()) {
      next.name = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Enter a valid email address.";
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      next.phone = "Enter a valid 10-digit phone number.";
    }

    if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);

      await api.post("/customer/register", formData);

      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      setServerError(
        error?.response?.data?.detail ||
          "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen bg-[#EFF3EC] font-[var(--font-body)]`}
    >
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* ---------------- Brand pane ---------------- */}
        <div className="relative hidden overflow-hidden bg-[#471cc9] px-12 py-14 text-[#EFF3EC] lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden="true">
            {AISLE_ICONS.map(({ Icon, top, left, size, rotate }, i) => (
              <Icon
                key={i}
                size={size}
                style={{ position: "absolute", top, left, transform: `rotate(${rotate}deg)` }}
              />
            ))}
          </div>

          <Link href="/" className="relative z-10 flex items-center gap-2">
            <ShoppingBasket size={22} className="text-[#E2A93D]" />
            <span className="text-lg font-semibold tracking-tight">PrimeBasket</span>
          </Link>

          <div className="relative z-10 max-w-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9CC2A9]">
              New here?
            </p>
            <h1 className="font-[var(--font-display)] text-[2.35rem] italic leading-[1.15] text-white">
              Start a basket worth coming back to.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#C4D9CA]">
              One account gets you saved addresses, order history, and faster
              checkout on every visit after this one.
            </p>
          </div>

          <p className="relative z-10 text-xs text-[#7FA089]">
            © {new Date().getFullYear()} PrimeBasket. Fresh to your door.
          </p>
        </div>

        {/* ---------------- Form pane ---------------- */}
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-[420px]">
            <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <ShoppingBasket size={22} className="text-[#471cc9]" />
              <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[#ffbc43]">
                PrimeBasket
              </span>
            </Link>

            {/* Receipt-notch card, matching the login page's signature detail */}
            <div className="relative">
              <div
                className="absolute inset-x-4 -top-[7px] z-10 flex justify-between"
                aria-hidden="true"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="h-3.5 w-3.5 rounded-full bg-[#EFF3EC]" />
                ))}
              </div>

              <div className="rounded-[6px] rounded-b-[28px] border border-[#DEE6DB] bg-white px-6 pb-8 pt-9 shadow-[0_1px_2px_rgba(18,53,36,0.06),0_12px_32px_-16px_rgba(18,53,36,0.18)] sm:px-8">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffbc43]">
                  PrimeBasket · Sign up
                </p>
                <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#16201A]">
                  Create your account
                </h2>
                <p className="mt-1 text-sm text-[#5B6B5F]">
                  Join PrimeBasket to start shopping in minutes.
                </p>

                {serverError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-[#F1C9C6] bg-[#FBEDEC] px-4 py-3 text-sm text-[#8C2B24]"
                  >
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                  <Field
                    label="Full name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    autoComplete="name"
                    autoFocus
                  />

                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                  />

                  <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                  />

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-[#2B352E]"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#E2A93D]/30 ${
                          errors.password
                            ? "border-[#C6544B] focus:border-[#C6544B]"
                            : "border-[#DEE6DB] focus:border-[#123524]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A968D] hover:text-[#2B352E]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-1.5 text-xs text-[#B3261E]">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff754b] py-2.5 font-medium text-white transition-colors hover:bg-[#ff754b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#ffbc43]">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-[#123524] ">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: keyof FormData;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

function Field({
  label,
  name,
  type,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
}: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-[#2B352E]">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#E2A93D]/30 ${
          error ? "border-[#C6544B] focus:border-[#C6544B]" : "border-[#DEE6DB] focus:border-[#123524]"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}