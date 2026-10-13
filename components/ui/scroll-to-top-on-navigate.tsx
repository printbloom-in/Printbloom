"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ScrollToTopOnNavigate() {
  const pathname = usePathname()

  useEffect(() => {
    // Only reset window scroll when the actual pathname/route changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}
