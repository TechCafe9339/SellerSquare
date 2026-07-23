import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/storefront/Header";
// import { CategoryNav } from "@/components/storefront/CategoryNav";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Footer } from "@/components/storefront/Footer";
import { CartWishlistProvider } from "@/lib/context/CartWishListContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrimeBasket",
  description: "Your everyday marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CartWishlistProvider>
            <div className="bg-gray-950 py-1.5 text-center text-[12.5px] text-indigo-100">
              Free delivery on orders above <strong className="text-white">₹499</strong> &nbsp;·&nbsp; Easy
              7-day returns &nbsp;·&nbsp; <strong className="text-white">New here?</strong> Get 10% off your
              first order
            </div>

            {/* <Header /> */}
            {/* <CategoryNav /> */}

            {children}

            {/* <Footer /> */}
            <Toaster position="top-center" />
          </CartWishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}