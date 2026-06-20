"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  LogOut,
  Store,
  Settings
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings
  }
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    localStorage.removeItem("seller_token");
    router.push("/login");
  };

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-2.5 border-b border-black/5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B0F19]">
          <Store size={18} className="text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-[#0B0F19]">
          SellerSquare
        </span>
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
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${active
                  ? "bg-[#0B0F19] text-white"
                  : "text-[#374151] hover:bg-black/5"
                }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}