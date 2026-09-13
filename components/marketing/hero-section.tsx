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
    <section className="flex flex-col-reverse md:flex-row w-full min-h-screen md:h-screen pt-20 md:pt-0">
      {/* Left Column: Text Content */}
      <div className="w-full md:w-1/2 h-full bg-[#FBF6EE] flex flex-col justify-center px-6 py-16 md:px-12 lg:px-24">
        <FadeInStagger className="flex flex-col items-start text-left max-w-xl mx-auto md:mx-0">
          <FadeInStaggerItem>
            <SectionHeading as="h1" className="text-[#221F1C] text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Turn your favorite memories into <br className="hidden lg:block" />
              <span className="relative inline-block mt-2">
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
            <p className="text-[#6B6259] text-lg md:text-xl mb-10 leading-relaxed">
              Custom magazines, photo frames, polaroids and more — elegantly designed from your photos and stories.
            </p>
          </FadeInStaggerItem>

          <FadeInStaggerItem>
            <Button size="lg" asChild className="text-lg bg-[#221F1C] text-white hover:bg-black hover:scale-105 transition-all duration-300 px-8 py-6 rounded-full shadow-lg">
              <NextLink href="/products">Create My Magazine</NextLink>
            </Button>
          </FadeInStaggerItem>
        </FadeInStagger>
      </div>

      {/* Right Column: Image */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-full relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full animate-hero-zoom">
          <Image
            src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Beautifully crafted custom photo magazine and memories"
            fill
            priority
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}
