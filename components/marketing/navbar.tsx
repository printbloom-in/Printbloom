"use client"
import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Search, User, ShoppingCart, ChevronRight, ChevronDown } from "lucide-react"
import { useUIStore } from "@/store/use-ui-store"
import { useCart } from "@/store/use-cart"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

// Primary desktop links: Reactions is OUTSIDE More as a visible primary link
const primaryNavLinks = [
  { href: "/products", label: "Shop" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/journal", label: "Journal" },
  { href: "/reactions", label: "Reactions" },
  { href: "/reviews", label: "Reviews" },
]

// More dropdown links: FAQ, About PrintBloom, Shipping & Delivery, Instagram
const moreDropdownLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About PrintBloom" },
  { href: "/policies/shipping", label: "Shipping & Delivery" },
  { href: "https://instagram.com/printbloom.in", label: "Instagram", external: true },
]

// Mobile drawer primary links
const mobilePrimaryLinks = [
  { href: "/products", label: "Shop" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/journal", label: "Journal" },
  { href: "/reactions", label: "Reactions" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About PrintBloom" },
]

// Mobile drawer secondary links
const mobileSecondaryLinks = [
  { href: "/policies/shipping", label: "Shipping & Delivery" },
  { href: "/policies/refund", label: "Returns & Refunds" },
  { href: "https://instagram.com/printbloom.in", label: "Instagram", external: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [moreOpen, setMoreOpen] = React.useState(false)
  const pathname = usePathname()
  const moreRef = React.useRef<HTMLDivElement>(null)
  
  const { openSearchModal, openAuthModal, openCartDrawer } = useUIStore()
  const cartItems = useCart((state) => state.items)

  // Auth State
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = React.useState<any>(null)
  const router = useRouter()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click or Esc
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Close dropdown and mobile menu on route change
  React.useEffect(() => {
    setMoreOpen(false)
    setMenuOpen(false)
  }, [pathname])

  const handleUserClick = () => {
    if (user) {
      router.push("/profile")
    } else {
      openAuthModal()
    }
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Only show transparent navbar on the homepage (hero has dark bg behind it)
  const isHomepage = pathname === "/"
  const isTransparent = isHomepage && !scrolled

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll lock: prevent background page from scrolling when mobile menu is open
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isMoreActive = moreDropdownLinks.some(link => !link.external && pathname === link.href)

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-[#FBF6EE]/95 backdrop-blur-sm border-b border-[#E0D9CF] shadow-sm"
      )}
    >
      <div className="w-full px-4 md:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <NextLink 
          href="/" 
          onClick={handleLogoClick}
          className="flex flex-col leading-none group"
        >
          <img src="/logo.png" alt="PrintBloom" className="h-10 md:h-12 w-auto aspect-square object-contain rounded-full shadow-sm transition-transform group-hover:scale-105" />
        </NextLink>

        {/* Desktop Nav: Shop | How It Works | Journal | Reactions | Reviews | More */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {primaryNavLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors hover:text-[#DFBC94]",
                isTransparent ? "text-white/90" : "text-[#221F1C]",
                pathname === link.href && "text-[#DFBC94] font-medium"
              )}
            >
              {link.label}
            </NextLink>
          ))}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors hover:text-[#DFBC94] flex items-center gap-1",
                isTransparent ? "text-white/90" : "text-[#221F1C]",
                (moreOpen || isMoreActive) && "text-[#DFBC94] font-medium"
              )}
              aria-haspopup="true"
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", moreOpen && "rotate-180")} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-md border border-[#E0D9CF] shadow-lg py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                {moreDropdownLinks.map((item) => (
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-sm text-[#221F1C] hover:bg-[#FBF6EE] hover:text-[#DFBC94] transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <NextLink
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block px-4 py-2.5 text-sm text-[#221F1C] hover:bg-[#FBF6EE] hover:text-[#DFBC94] transition-colors",
                        pathname === item.href && "text-[#DFBC94] font-medium bg-[#FBF6EE]"
                      )}
                    >
                      {item.label}
                    </NextLink>
                  )
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={openSearchModal}
            className={cn(
              "transition-colors hover:text-[#DFBC94]",
              isTransparent ? "text-white" : "text-[#221F1C]"
            )}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={handleUserClick}
            className={cn(
              "transition-colors hover:text-[#DFBC94] flex items-center justify-center",
              isTransparent ? "text-white" : "text-[#221F1C]"
            )}
            aria-label="Profile"
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[#E0D9CF]" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
          <button 
            onClick={openCartDrawer}
            className={cn(
              "relative transition-colors hover:text-[#DFBC94]",
              isTransparent ? "text-white" : "text-[#221F1C]"
            )}
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {isMounted && cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#DFBC94] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Header Right: Permanent Profile + Cart + Menu */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
          {/* Profile control: visually clear, standard tap size */}
          <button 
            onClick={handleUserClick}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5",
              isTransparent ? "text-white hover:bg-white/10" : "text-[#221F1C]"
            )}
            aria-label="Profile"
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-[#E0D9CF]" />
            ) : (
              <User className="w-5 h-5" strokeWidth={2} />
            )}
          </button>

          {/* Cart control */}
          <button 
            onClick={openCartDrawer}
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5",
              isTransparent ? "text-white hover:bg-white/10" : "text-[#221F1C]"
            )}
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            {isMounted && cartItems.length > 0 && (
              <span className="absolute top-1 right-1 bg-[#DFBC94] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={cn(
                "block w-5 h-0.5 transition-all duration-300",
                isTransparent ? "bg-white" : "bg-[#221F1C]",
                menuOpen && "rotate-45 translate-y-2"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 transition-all duration-300",
                isTransparent ? "bg-white" : "bg-[#221F1C]",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block w-5 h-0.5 transition-all duration-300",
                isTransparent ? "bg-white" : "bg-[#221F1C]",
                menuOpen && "-rotate-45 -translate-y-2"
              )}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {menuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity"
          style={{ top: '80px' }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed left-0 right-0 bg-[#FBF6EE] border-b border-[#E0D9CF] px-5 py-6 flex flex-col z-50 overflow-y-auto shadow-xl" style={{ top: '80px', maxHeight: 'calc(100dvh - 80px)' }}>
          
          {/* Quick Search Action */}
          <div className="pb-4">
            <button 
              onClick={() => { setMenuOpen(false); openSearchModal(); }}
              className="w-full flex items-center gap-3 text-[#221F1C] hover:text-[#DFBC94] px-4 py-3 bg-white rounded-lg shadow-sm border border-[#E0D9CF] text-sm font-medium"
            >
              <Search className="w-4 h-4 text-[#9A8F85]" /> 
              <span>Search products, memories...</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
          <div className="flex flex-col border-t border-[#E0D9CF]">
            {mobilePrimaryLinks.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                className="flex items-center justify-between py-3.5 border-b border-[#E0D9CF]/50 text-base text-[#221F1C] hover:text-[#DFBC94] transition-colors px-2"
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-medium tracking-wide">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-[#9A8F85]" />
              </NextLink>
            ))}
          </div>

          {/* Secondary Support Links (Neatly grouped below divider, no duplicate Shop Gifts CTA) */}
          <div className="mt-6 pt-4 border-t border-[#E0D9CF] flex flex-col gap-2.5 pb-8">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#9A8F85] px-2 mb-1">Support & Social</span>
            {mobileSecondaryLinks.map((link) => (
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2 px-2 text-sm text-[#6B6259] hover:text-[#DFBC94] transition-colors"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#9A8F85]">↗</span>
                </a>
              ) : (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between py-2 px-2 text-sm text-[#6B6259] hover:text-[#DFBC94] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9A8F85]" />
                </NextLink>
              )
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
