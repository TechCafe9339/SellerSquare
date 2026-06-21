"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "default" | "success" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  variant?: ToastVariant;
  duration?: number; // ms; defaults to 4000
  action?: ToastAction;
}

interface Toast extends ToastOptions {
  id: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: typeof Info; iconClass: string }> = {
  default: { icon: Info, iconClass: "text-[#6B7280]" },
  success: { icon: CheckCircle2, iconClass: "text-green-600" },
  error: { icon: AlertCircle, iconClass: "text-red-600" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = crypto.randomUUID();
      const duration = options?.duration ?? 4000;

      setToasts((prev) => [...prev, { id, message, ...options }]);

      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast viewport: bottom-center on mobile, bottom-right on desktop */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => {
          const variant = toast.variant ?? "default";
          const { icon: Icon, iconClass } = VARIANT_STYLES[variant];

          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-lg"
            >
              <Icon size={18} className={`flex-shrink-0 ${iconClass}`} />
              <span className="flex-1 text-sm text-[#0B0F19]">{toast.message}</span>

              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    dismissToast(toast.id);
                  }}
                  className="flex-shrink-0 text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  {toast.action.label}
                </button>
              )}

              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="flex-shrink-0 text-[#9CA3AF] hover:text-[#0B0F19]"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}