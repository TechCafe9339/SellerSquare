import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SellerSidebar from "@/components/SellerSidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seller Dashboard - SellerSquare",
  description: "SellerSquare is a powerful multi-vendor eCommerce platform designed for customers, sellers, and administrators. Customers can discover and purchase products from multiple sellers, sellers can manage products and orders through a dedicated dashboard, and administrators can oversee the entire marketplace. With secure authentication, order management, product catalogs, and a user-friendly shopping experience, SellerSquare provides a complete online marketplace solution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
