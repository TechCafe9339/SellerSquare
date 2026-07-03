"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedSeller({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("seller_token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}