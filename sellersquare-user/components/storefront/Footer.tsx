import Link from "next/link";

const columns = [
  {
    title: "PrimeBasket",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Sell on PrimeBasket", href: "/sell" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track your order", href: "/orders" },
      { label: "Returns & refunds", href: "/returns" },
      { label: "Shipping info", href: "/shipping" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "Policy",
    links: [
      { label: "Terms of use", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Security", href: "/security" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "#" },
      { label: "X (Twitter)", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-5 bg-gray-950 text-gray-400">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4 md:px-7">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold text-white">{col.title}</h4>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-1 text-[13px] transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-5 md:px-7">
        <span className="text-xs text-gray-500">© 2026 PrimeBasket. All rights reserved.</span>
        <div className="flex gap-2">
          {["UPI", "Visa", "Mastercard", "COD"].map((p) => (
            <span key={p} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold">
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}