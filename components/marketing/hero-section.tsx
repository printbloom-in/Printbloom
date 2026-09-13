"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { SectionHeading } from "@/components/ui/section-heading"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/ui/fade-in"
import NextLink from "next/link"

const emotionWords = [
  "unforgettable",
  "timeless",
  "emotional",
  "precious",
  "forever",
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % emotionWords.length)
        // Fade back in
        setIsVisible(true)
      }, 400)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full h-screen min-h-[680px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 w-full h-full animate-hero-zoom">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
            alt="Friends laughing and sharing memories together"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Warm dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/70"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 flex flex-col items-center text-center">
        <FadeInStagger className="flex flex-col items-center">
          <FadeInStaggerItem>
            <SectionHeading as="h1" className="text-white max-w-3xl drop-shadow-sm mb-6">
              Turn your favorite memories into{" "}
              <span className="relative inline-block">
                <span
                  style={{
                    display: "inline-block",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(-10px)",
                    color: "#F87E61",
                    fontStyle: "italic",
                  }}
                >
                  {emotionWords[currentIndex]}
                </span>
                {/* Animated underline */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#F87E61",
                    transition: "opacity 0.4s ease",
                    opacity: isVisible ? 0.7 : 0,
                  }}
                />
              </span>{" "}
              gifts they'll never forget.
            </SectionHeading>
          </FadeInStaggerItem>

          <FadeInStaggerItem>
            <p className="text-surface text-lg md:text-xl max-w-xl mb-10 drop-shadow-sm">
              Custom magazines, photo frames, polaroids and more — designed from your photos and stories.
            </p>
          </FadeInStaggerItem>

          <FadeInStaggerItem>
            <Button size="lg" asChild className="text-lg hover:scale-105 transition-transform duration-300">
              <NextLink href="/products">Create My Magazine</NextLink>
            </Button>
          </FadeInStaggerItem>
        </FadeInStagger>
      </div>
    </section>
  )
}
