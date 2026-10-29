"use client"

import { usePathname } from "next/navigation"

export function WhatsAppFloat() {
  const pathname = usePathname()
  
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const isCart = pathname?.startsWith("/cart")

  const phoneNumber = "918691094045" // Official PrintBloom number
  const message = encodeURIComponent("Hi PrintBloom! I need help with my custom memory gift.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with PrintBloom on WhatsApp"
      className={`fixed ${isCart ? "bottom-24 md:bottom-6 right-4 md:right-6 hidden sm:block" : "bottom-6 right-6"} z-40 group`}
    >
      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 scale-100 group-hover:scale-125 transition-transform duration-500 animate-ping" />
      
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-[#221F1C] text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none shadow-lg">
        Chat with us on WhatsApp
        <span className="absolute top-full right-4 border-4 border-transparent border-t-[#221F1C]" />
      </span>

      {/* Main button */}
      <span className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5C] rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
        {/* Official WhatsApp icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className="w-10 h-10"
        >
          {/* White WhatsApp speech-circle outline */}
          <path
            d="M50 22 C34.5 22 22 34.5 22 50 C22 55.1 23.4 60 26 64.2 L22.5 77.5 L36.1 74 C40.2 76.5 45 78 50 78 C65.5 78 78 65.5 78 50 C78 34.5 65.5 22 50 22Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* WhatsApp phone */}
          <path
            d="M41.5 37.5 C40.5 37.5 39.5 38 38.8 39 C37.2 41.2 36.5 43.5 37.2 46 C39.5 54.2 45.8 60.5 54 62.8 C56.5 63.5 58.8 62.8 61 61.2 C62 60.5 62.5 59.5 62.5 58.5 C62.5 57.5 62 56.8 61.2 56.3 L56.5 53.8 C55.7 53.4 54.8 53.5 54.2 54.2 L52.2 56.2 C49.5 54.8 45.2 50.5 43.8 47.8 L45.8 45.8 C46.5 45.2 46.6 44.3 46.2 43.5 L43.7 38.8 C43.2 38 42.5 37.5 41.5 37.5Z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    </a>
  )
}
