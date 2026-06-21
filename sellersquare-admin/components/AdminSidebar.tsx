"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  LogOut,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useToast } from "./Toast";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sellers", href: "/sellers", icon: Store },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Settings", href: "/settings", icon: Settings },
];

const LOGOUT_DELAY_MS = 4000;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast, dismissToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tracks the pending logout so Undo can cancel it, and so unmounting
  // mid-countdown doesn't leave a stray timer running.
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const performLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  const cancelLogout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (logoutToastIdRef.current) {
      dismissToast(logoutToastIdRef.current);
      logoutToastIdRef.current = null;
    }
    showToast("Logout cancelled.", { variant: "default", duration: 2000 });
  };

  const logout = () => {
    const id = showToast("Logging you out…", {
      duration: LOGOUT_DELAY_MS,
      action: { label: "Undo", onClick: cancelLogout },
    });
    logoutToastIdRef.current = id;

    logoutTimerRef.current = setTimeout(() => {
      performLogout();
    }, LOGOUT_DELAY_MS);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-black/5 bg-[#0B0F19] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            SellerSquare
            <span className="ml-1 font-normal text-white/50">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: static on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0B0F19] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-white">
                SellerSquare
              </div>
              <div className="text-xs text-white/50">Admin panel</div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[#0B0F19]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}