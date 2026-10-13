"use client"

import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Gifts" },
    { href: "/products/custom-magazine-a5", label: "Magazines" },
    { href: "/products/polaroids", label: "Polaroids" },
    { href: "/products/photo-frames", label: "Frames" },
    { href: "/products/spotify-cards", label: "Small Gifts" },
  ],
  Help: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/faq", label: "FAQ" },
    { href: "/policies/shipping", label: "Shipping & Delivery" },
    { href: "/policies/refund", label: "Returns & Refunds" },
    { href: "https://wa.me/918691094045", label: "Contact Us" },
  ],
  Legal: [
    { href: "/policies/privacy", label: "Privacy Policy" },
    { href: "/policies/terms", label: "Terms & Conditions" },
  ],
  Connect: [
    { href: "https://wa.me/918691094045", label: "Chat on WhatsApp" },
    { href: "https://instagram.com/printbloom.in", label: "Instagram" },
    { href: "mailto:printbloom.in@gmail.com", label: "printbloom.in@gmail.com" },
  ],
}

export function Footer() {
  const pathname = usePathname()

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-[#221F1C] text-[#FBF6EE] pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <NextLink 
              href="/" 
              onClick={handleLogoClick}
              className="flex flex-col leading-none w-fit group"
            >
              <img src="/logo.png" alt="PrintBloom" className="h-12 w-auto aspect-square object-contain rounded-full shadow-sm transition-transform group-hover:scale-105" />
            </NextLink>
            <p className="text-[#9A8F85] text-sm leading-relaxed max-w-xs">
              Turn your favourite memories into beautifully crafted gifts they'll keep forever.
              Custom magazines, polaroids, frames and more.
            </p>
            <a
              href="https://wa.me/918691094045"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] px-4 py-2.5 text-sm w-fit hover:bg-[#25D366]/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-[#9A8F85]">
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <NextLink
                      href={link.href}
                      className="text-sm text-[#FBF6EE]/70 hover:text-[#DFBC94] transition-colors"
                    >
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[#9A8F85] text-xs">
          <p>
            &copy; {new Date().getFullYear()} PrintBloom. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="font-mono">
              Made with love in India 🇮🇳 ❤️
            </p>
            <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#9A8F85]/50"></span>
            <a 
              href="https://my-portfolio-coral-rho-5fuq441i1t.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative inline-block group hover:text-[#FBF6EE] transition-colors"
            >
              Designed & Developed by Rupesh Vishwakarma
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#DFBC94] scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
