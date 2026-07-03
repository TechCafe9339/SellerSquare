export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  category: string;
  imageUrl?: string;
  // used only until real product photos exist
  gradientFrom: string;
  gradientTo: string;
}

export interface MegaMenuColumn {
  title: string;
  items: { label: string; href: string }[];
}

export interface Category {
  slug: string;
  label: string;
  megaMenu?: MegaMenuColumn[];
}

export function discountPercent(product: Pick<Product, "price" | "mrp">) {
  if (product.mrp <= 0) return 0;
  return Math.round(100 - (product.price / product.mrp) * 100);
}