import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FaFacebookF,
    hoverClass: "hover:text-indigo-400",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: FaInstagram,
    hoverClass: "hover:text-pink-400",
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: FaTwitter,
    hoverClass: "hover:text-sky-400",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: FaYoutube,
    hoverClass: "hover:text-red-500",
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold">PrimeBasket</h2>

            <p className="mt-4 text-gray-400 leading-relaxed max-w-sm">
              Your trusted online marketplace for electronics, fashion,
              books, furniture, and much more.
            </p>

            <div className="flex gap-2 mt-6 -ml-1.5">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`p-1.5 text-gray-400 transition-colors ${hoverClass}`}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

            <div className="space-y-3 text-gray-400">
              <Link href="/" className="block hover:text-white">
                Home
              </Link>
              <Link href="/products" className="block hover:text-white">
                Products
              </Link>
              <Link href="/wishlist" className="block hover:text-white">
                Wishlist
              </Link>
              <Link href="/cart" className="block hover:text-white">
                Cart
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>

            <div className="space-y-3 text-gray-400">
              <Link href="#" className="block hover:text-white">
                Help Center
              </Link>
              <Link href="#" className="block hover:text-white">
                Returns
              </Link>
              <Link href="#" className="block hover:text-white">
                Shipping Policy
              </Link>
              <Link href="#" className="block hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>

            <div className="space-y-4 text-gray-400">
              <a
                href="mailto:support@primebasket.com"
                className="flex gap-3 hover:text-white transition-colors"
              >
                <MdEmail size={18} className="shrink-0 mt-0.5" />
                <span className="break-all">support@primebasket.com</span>
              </a>

              <a
                href="tel:+919876543210"
                className="flex gap-3 hover:text-white transition-colors"
              >
                <MdPhone size={18} className="shrink-0 mt-0.5" />
                <span>+91 9876543210</span>
              </a>

              <div className="flex gap-3">
                <MdLocationOn size={18} className="shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © 2026 PrimeBasket. All rights reserved.
          </p>

          <p className="text-gray-500 text-sm">Built with Next.js & FastAPI</p>
        </div>
      </div>
    </footer>
  );
}