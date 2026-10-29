import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrintBloom | Turn Your Memories into Gifts",
  description: "Personalized magazines, polaroids, and frames. Turn your favorite memories into beautifully crafted gifts they'll keep forever.",
  keywords: ["personalized gifts", "custom magazine", "photo printing", "polaroid prints", "anniversary gifts", "birthday gifts"],
  openGraph: {
    title: "PrintBloom",
    description: "Personalized custom magazines and photo gifts.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.printbloom.in",
    siteName: "PrintBloom",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.printbloom.in"}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

import { GlobalModals } from "@/components/global-modals";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";
import { CartSync } from "@/components/cart-sync";
import Script from "next/script";
import { Toaster } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import { ScrollToTopOnNavigate } from "@/components/ui/scroll-to-top-on-navigate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=IBM+Plex+Mono:wght@400&family=Public+Sans:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className="antialiased bg-[#FBF6EE] text-[#221F1C] font-sans selection:bg-[#DFBC94] selection:text-white"
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#E2858E"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #E2858E,0 0 5px #E2858E"
          zIndex={1600}
        />
        <ScrollToTopOnNavigate />
        <CartSync />
        {children}
        <GlobalModals />
        <ConfirmModal />
        <WhatsAppFloat />
        <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'var(--font-public-sans)', background: '#221F1C', color: '#FBF6EE', border: 'none' } }} />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
