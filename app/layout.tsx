import * as React from "react";
import type { Metadata } from "next";
import { Fraunces, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";


const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "PrintBloom | Turn Your Memories into Gifts",
  description: "Personalized magazines, polaroids, and frames. Turn your favorite memories into beautifully crafted gifts they'll keep forever.",
  keywords: ["personalized gifts", "custom magazine", "photo printing", "polaroid prints", "anniversary gifts", "birthday gifts"],
  openGraph: {
    title: "PrintBloom",
    description: "Personalized custom magazines and photo gifts.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://printbloom.vercel.app",
    siteName: "PrintBloom",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://printbloom.vercel.app"}/og-image.jpg`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${publicSans.variable} ${ibmPlexMono.variable} antialiased bg-[#FBF6EE] text-[#221F1C] font-sans selection:bg-[#DFBC94] selection:text-white`}
        suppressHydrationWarning
      >
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
