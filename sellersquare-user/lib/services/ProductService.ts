import api from "@/lib/api";
import { Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  const res = await api.get("/products");
  return res.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}