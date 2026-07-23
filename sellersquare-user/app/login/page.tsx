"use client";

import { useCallback, useMemo, useState } from "react";
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
import { useAuth } from "@/lib/context/AuthContext";

// ---- Type pairing: an editorial serif for the brand voice, a warm
// geometric sans for everything the person actually reads/uses. ----
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "That email doesn't look right.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

// Loose scatter of grocery iconography for the brand pane — quiet texture,
// not a literal illustration, so it reads at a glance and never competes
// with the headline.
const AISLE_ICONS = [
  { Icon: ShoppingBasket, top: "8%", left: "72%", size: 46, rotate: -8 },
  { Icon: Apple, top: "22%", left: "18%", size: 30, rotate: 6 },
  { Icon: Carrot, top: "58%", left: "10%", size: 34, rotate: -14 },
  { Icon: Milk, top: "68%", left: "80%", size: 32, rotate: 10 },
  { Icon: Wheat, top: "40%", left: "85%", size: 28, rotate: -4 },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Re-validated on every change, but cheap (two checks) — no need to
  // debounce or memoize beyond useMemo keeping the object reference stable.
  const errors = useMemo(() => validate(email, password), [email, password]);
  const canSubmit = !errors.email && !errors.password && !loading;

  const handleBlur = useCallback(
    (field: "email" | "password") => setTouched((prev) => ({ ...prev, [field]: true })),
    []
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      setServerError("");

      if (errors.email || errors.password) return;

      setLoading(true);
      try {
        const res = await api.post("/customer/login", { email, password });
        login(res.data.access_token);
        router.push("/");
      } catch (error: any) {
        setServerError(
          error?.response?.data?.detail ||
          "Couldn't log you in. Check your email and password and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [email, password, errors, login, router]
  );

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
              Member login
            </p>
            <h1 className="font-[var(--font-display)] text-[2.35rem] italic leading-[1.15] text-white">
              Your basket's exactly how you left it.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#C4D9CA]">
              Log back in to pick up your saved lists, past orders, and delivery
              slots — nothing lost, nothing to redo.
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
              <ShoppingBasket size={22} className="text-[#123524]" />
              <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[#123524]">
                PrimeBasket
              </span>
            </Link>

            {/* Receipt-notch card: a row of "punched" circles reads as a
                torn receipt edge — the one deliberate flourish on the page. */}
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
                  PrimeBasket · Sign in
                </p>
                <h2 className="font-[var(--font-display)] text-2xl font-semibold text-[#16201A]">
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-[#5B6B5F]">
                  Log in to continue to your account.
                </p>

                {serverError && (
                  <div
                    role="alert"
                    className="mt-5 rounded-lg border border-[#F1C9C6] bg-[#FBEDEC] px-4 py-3 text-sm text-[#8C2B24]"
                  >
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-[#2B352E]"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      autoComplete="email"
                      autoFocus
                      required
                      aria-invalid={Boolean(touched.email && errors.email)}
                      aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#E2A93D]/30 ${touched.email && errors.email
                          ? "border-[#C6544B] focus:border-[#C6544B]"
                          : "border-[#DEE6DB] focus:border-[#123524]"
                        }`}
                    />
                    {touched.email && errors.email && (
                      <p id="email-error" className="mt-1.5 text-xs text-[#B3261E]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-[#2B352E]">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-[#471cc9] hover:text-[#E2A93D]"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        autoComplete="current-password"
                        required
                        aria-invalid={Boolean(touched.password && errors.password)}
                        aria-describedby={
                          touched.password && errors.password ? "password-error" : undefined
                        }
                        className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#E2A93D]/30 ${touched.password && errors.password
                            ? "border-[#C6544B] focus:border-[#C6544B]"
                            : "border-[#DEE6DB] focus:border-[#471cc9]"
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
                    {touched.password && errors.password && (
                      <p id="password-error" className="mt-1.5 text-xs text-[#B3261E]">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff754b] py-2.5 font-medium text-white transition-colors hover:bg-[#ff754b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? "Logging in…" : "Log in"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-[#ffbc43]">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-medium text-[#123524]">
                    Create one
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