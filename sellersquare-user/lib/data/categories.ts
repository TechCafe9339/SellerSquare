import { Category } from "@/lib/types";

// TODO: replace with a server-side fetch to your categories API,
// e.g. `const categories = await fetch(`${API_URL}/categories`).then(r => r.json())`
export const categories: Category[] = [
  { slug: "for-you", label: "For You" },
  {
    slug: "fashion",
    label: "Fashion",
    megaMenu: [
      {
        title: "Women",
        items: [
          { label: "Dresses", href: "/fashion/women/dresses" },
          { label: "Kurtas & Sets", href: "/fashion/women/kurtas" },
          { label: "Sarees", href: "/fashion/women/sarees" },
          { label: "Footwear", href: "/fashion/women/footwear" },
        ],
      },
      {
        title: "Men",
        items: [
          { label: "Shirts", href: "/fashion/men/shirts" },
          { label: "T-Shirts", href: "/fashion/men/tshirts" },
          { label: "Jeans", href: "/fashion/men/jeans" },
          { label: "Footwear", href: "/fashion/men/footwear" },
        ],
      },
      {
        title: "Trending",
        items: [
          { label: "Summer Edit", href: "/fashion/trending/summer" },
          { label: "Ethnic Wear", href: "/fashion/trending/ethnic" },
          { label: "Accessories", href: "/fashion/trending/accessories" },
          { label: "Sale Zone", href: "/fashion/sale" },
        ],
      },
    ],
  },
  {
    slug: "mobiles",
    label: "Mobiles",
    megaMenu: [
      {
        title: "Shop by Brand",
        items: [
          { label: "Samsung", href: "/mobiles/samsung" },
          { label: "Apple", href: "/mobiles/apple" },
          { label: "OnePlus", href: "/mobiles/oneplus" },
          { label: "Xiaomi", href: "/mobiles/xiaomi" },
        ],
      },
      {
        title: "Budget",
        items: [
          { label: "Under ₹15,000", href: "/mobiles/budget/under-15000" },
          { label: "₹15,000–30,000", href: "/mobiles/budget/15-30k" },
          { label: "₹30,000+", href: "/mobiles/budget/30k-plus" },
          { label: "Flagships", href: "/mobiles/flagships" },
        ],
      },
      {
        title: "Accessories",
        items: [
          { label: "Cases & Covers", href: "/mobiles/accessories/cases" },
          { label: "Chargers", href: "/mobiles/accessories/chargers" },
          { label: "Earbuds", href: "/mobiles/accessories/earbuds" },
          { label: "Power Banks", href: "/mobiles/accessories/powerbanks" },
        ],
      },
    ],
  },
  { slug: "beauty", label: "Beauty" },
  { slug: "electronics", label: "Electronics" },
  { slug: "home", label: "Home" },
  { slug: "appliances", label: "Appliances" },
  { slug: "toys-baby", label: "Toys & Baby" },
  { slug: "sports", label: "Sports" },
];

// Data for the "Shop by category" tile grid — icon/color per category
export const categoryTiles = [
  { slug: "mobiles", label: "Mobiles", from: "from-indigo-600", to: "to-indigo-400" },
  { slug: "fashion", label: "Fashion", from: "from-pink-600", to: "to-pink-400" },
  { slug: "electronics", label: "Electronics", from: "from-teal-600", to: "to-teal-400" },
  { slug: "home", label: "Home", from: "from-amber-700", to: "to-amber-500" },
  { slug: "appliances", label: "Appliances", from: "from-slate-700", to: "to-slate-500" },
  { slug: "beauty", label: "Beauty", from: "from-rose-700", to: "to-rose-500" },
  { slug: "toys-baby", label: "Toys & Baby", from: "from-sky-700", to: "to-sky-400" },
  { slug: "sports", label: "Sports", from: "from-green-700", to: "to-green-500" },
];