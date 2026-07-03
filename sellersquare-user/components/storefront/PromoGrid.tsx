import Link from "next/link";

const promos = [
  { title: "Home & Kitchen", sub: "Starting ₹299", href: "/home", from: "from-teal-600", to: "to-teal-800" },
  { title: "Beauty Picks", sub: "Buy 2 Get 1 Free", href: "/beauty", from: "from-pink-600", to: "to-rose-800" },
  { title: "Sports & Fitness", sub: "Up to 50% off", href: "/sports", from: "from-indigo-600", to: "to-indigo-900" },
];

export function PromoGrid() {
  return (
    <section className="px-5 py-9 md:px-7">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-4 md:grid-cols-3">
        {promos.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`relative flex min-h-[150px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${p.from} ${p.to} p-6 text-white`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold">{p.title}</h3>
              <span className="text-xs opacity-90">{p.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}