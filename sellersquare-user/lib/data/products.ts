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

// Each category now has its own name + brand pool, so switching categories
// actually shows different products instead of the same 12 items relabeled.
const CATALOG: Record<string, { names: string[]; brands: string[] }> = {
  mobiles: {
    names: ["5G Smartphone 128GB", "Wireless Earbuds Pro", "Fast Charger 65W", "Phone Case — Shockproof", "Power Bank 20000mAh", "Screen Protector Glass"],
    brands: ["Pulse", "Nova", "Voltx", "Shieldon", "Chargeit", "Clearview"],
  },
  fashion: {
    names: ["Cotton Casual Shirt", "Slim Fit Denim Jeans", "Ethnic Kurta Set", "Running Shoes — Mesh", "Everyday Backpack 25L", "Summer Cotton Dress"],
    brands: ["Urban Trail", "Denimly", "Weavecraft", "Stride", "Trekker", "Meadowlane"],
  },
  electronics: {
    names: ["Wireless Over-Ear Headphones", "4K Streaming Stick", "Portable Bluetooth Speaker", "Smart LED TV 43-inch", "Noise Cancelling Earbuds", "Gaming Mouse — Wired"],
    brands: ["Nova", "Boomline", "Visionary", "Clarity", "Pulse", "Gripwell"],
  },
  home: {
    names: ["Ceramic Cookware Set (5pc)", "Non-stick Frying Pan", "Cotton Bedsheet Set", "LED Desk Lamp", "Storage Organizer Box", "Wall Clock — Minimalist"],
    brands: ["Cookmate", "Homecraft", "Threadwell", "Glowlight", "Tidybox", "Timeframe"],
  },
  appliances: {
    names: ["Mixer Grinder 750W", "Electric Kettle 1.5L", "Air Fryer 4L", "Room Heater — Fan Type", "Induction Cooktop", "Vacuum Cleaner Handheld"],
    brands: ["Kettleworks", "Heatline", "Airtouch", "Cookmate", "Vaccu", "Powerhome"],
  },
  beauty: {
    names: ["Vitamin C Face Serum", "Matte Lipstick Set", "Hair Dryer — 1800W", "Sunscreen SPF 50", "Herbal Face Wash", "Perfume — Eau de Parfum"],
    brands: ["Glowlight", "Meadowlane", "Airtouch", "Sunveil", "Purenat", "Scentrix"],
  },
  "toys-baby": {
    names: ["Building Blocks Set 100pc", "Baby Stroller — Lightweight", "Soft Plush Teddy Bear", "Remote Control Car", "Baby Feeding Bottle Set", "Educational Puzzle Board"],
    brands: ["Playnest", "Trekker", "Cuddleup", "Zoomtrack", "Purenat", "Brightmind"],
  },
  sports: {
    names: ["Running Shoes — Mesh", "Yoga Mat — Non-slip", "Cricket Bat — Kashmir Willow", "Football — Size 5", "Adjustable Dumbbell Set", "Cycling Helmet"],
    brands: ["Stride", "Flexcore", "Willowcraft", "Kickline", "Ironset", "Safehead"],
  },
};

// Fallback pool for slugs not explicitly listed above (e.g. "deal", "recommended", "general" used on the homepage)
const DEFAULT_CATALOG = {
  names: ["Wireless Over-Ear Headphones", "Smart Fitness Band", "Cotton Casual Shirt", "4K Streaming Stick", "Ceramic Cookware Set (5pc)", "Running Shoes — Mesh"],
  brands: ["Nova", "Aura", "Urban Trail", "Pulse", "Homecraft", "Stride"],
};

function catalogFor(category: string) {
  return CATALOG[category] ?? DEFAULT_CATALOG;
}

// Deterministic on purpose: the same (category, i) pair always produces the same product,
// which is what lets getProductById reconstruct a product just from parsing its own id.
function buildProduct(i: number, category: string): Product {
  const { names, brands } = catalogFor(category);
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
}

// TODO: replace this generator with a real fetch, e.g.:
// export async function getMockProducts(count, offset, category) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category=${category}&limit=${count}`, { next: { revalidate: 60 } });
//   return res.json() as Promise<Product[]>;
// }
export function getMockProducts(count: number, offset = 0, category = "general"): Product[] {
  return Array.from({ length: count }, (_, idx) => buildProduct(idx + offset, category));
}

// TODO: replace with a real fetch, e.g.:
// export async function getProductById(id: string) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
//   if (!res.ok) return undefined;
//   return res.json() as Promise<Product>;
// }
export function getProductById(id: string): Product | undefined {
  const lastDash = id.lastIndexOf("-");
  if (lastDash === -1) return undefined;

  const category = id.slice(0, lastDash);
  const i = Number(id.slice(lastDash + 1));
  if (Number.isNaN(i)) return undefined;

  return buildProduct(i, category);
}