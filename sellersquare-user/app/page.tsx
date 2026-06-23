"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import CustomerHome from "@/components/CustomerHome";

export default function HomePage() {
  const router = useRouter();

  const handleAddToCart = async () => {
    const token = localStorage.getItem(
      "customer_token"
    );

    if (!token) {
      toast.error(
        "Please login to add items to cart"
      );
      router.push("/login");
      return;
    }

    // Call add to cart API
  };

  return (
    <CustomerHome
      handleAddToCart={handleAddToCart}
    />
  );
}