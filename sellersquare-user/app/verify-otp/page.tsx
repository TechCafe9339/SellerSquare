"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Store } from "lucide-react";
import api from "@/lib/api";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const otp = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    // Only allow a single numeric character per box
    const sanitized = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = sanitized;
    setDigits(next);
    setError("");

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted
      .slice(0, OTP_LENGTH)
      .split("")
      .forEach((char, i) => (next[i] = char));
    setDigits(next);

    const lastFilled = Math.min(pasted.length, OTP_LENGTH) - 1;
    inputRefs.current[Math.max(lastFilled, 0)]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the full ${OTP_LENGTH}-digit code`);
      return;
    }

    try {
      setLoading(true);

      await api.post("/customer/verify-otp", { email, otp });

      setSuccessMessage("Email verified. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "That code didn't work. Check it and try again."
      );
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");

    try {
      setResending(true);
      await api.post("/customer/resend-otp", { email });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Couldn't resend the code. Try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8 text-gray-900"
        >
          <Store size={24} className="text-indigo-600" />
          <span className="font-bold text-xl tracking-tight">
            PrimeBasket
          </span>
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1.5">
            Enter the {OTP_LENGTH}-digit code sent to
            <br />
            <span className="font-medium text-gray-700">
              {email || "your email"}
            </span>
          </p>

          {successMessage && (
            <div className="mt-5 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          {error && !successMessage && (
            <div className="mt-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-6">
            <div className="flex justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || !!successMessage}
                  className={`w-full max-w-12 aspect-square text-center text-lg font-semibold border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${
                    error ? "border-red-300" : "border-gray-200"
                  }`}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Verifying..." : "Verify code"}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-indigo-600 font-medium hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resending
                ? "Resending..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}