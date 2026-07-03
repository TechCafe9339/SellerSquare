import { Product } from "@/lib/types";

const palettes = [
  ["from-indigo-600", "to-indigo-400"],
  ["from-teal-600", "to-teal-400"],
  ["from-pink-600", "to-pink-400"],
  ["from-amber-700", "to-amber-500"],
  ["from-green-700", "to-green-500"],
  ["from-slate-700", "to-slate-500"],
  ["from-rose-700", "to-rose-500"],
  ["from-sky-700", "to-sky-400"],
];

const names = [
  "Wireless Over-Ear Headphones",
  "Smart Fitness Band",
  "Cotton Casual Shirt",
  "4K Streaming Stick",
  "Ceramic Cookware Set (5pc)",
  "Running Shoes — Mesh",
  "Stainless Steel Bottle 1L",
  "Portable Bluetooth Speaker",
  "Everyday Backpack 25L",
  "Slim Fit Denim Jeans",
  "LED Desk Lamp",
  "Non-stick Frying Pan",
];

const brands = [
  "Nova", "Aura", "Urban Trail", "Pulse", "Homecraft", "Stride",
  "Kettleworks", "Boomline", "Trekker", "Denimly", "Glowlight", "Cookmate",
];

// TODO: replace this generator with a real fetch, e.g.:
// export async function getProducts(params) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${qs}`, { next: { revalidate: 60 } });
//   return res.json() as Promise<Product[]>;
// }
export function getMockProducts(count: number, offset = 0, category = "general"): Product[] {
  return Array.from({ length: count }, (_, idx) => {
    const i = idx + offset;
    const pal = palettes[i % palettes.length];
    const price = 399 + (i * 137) % 3200;
    const mrp = Math.round(price * (1.3 + (i % 4) * 0.15));
    return {
      id: `${category}-${i}`,
      name: names[i % names.length],
      brand: brands[i % brands.length],
      price,
      mrp,
      rating: Number((3.8 + (i % 12) * 0.1).toFixed(1)),
      reviews: 120 + (i * 57) % 4800,
      category,
      gradientFrom: pal[0],
      gradientTo: pal[1],
    };
  });
}