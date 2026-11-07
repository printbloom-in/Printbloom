"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import NextLink from "next/link"
import Image from "next/image"
import { CheckCircle2, AlertTriangle, ArrowRight, Mail, LogIn, ExternalLink } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useUIStore } from "@/store/use-ui-store"
import { toast } from "sonner"
import { resendConfirmationEmail } from "@/app/actions/auth"

function VerifiedContent() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status") || "success"
  const nextTarget = searchParams.get("next") || "/profile"

  const { openAuthModal } = useUIStore()
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  // Resend form state for recovery
  const [resendEmail, setResendEmail] = React.useState("")
  const [resending, setResending] = React.useState(false)
  const [resendSent, setResendSent] = React.useState(false)

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null)
      setLoading(false)
    })
  }, [])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resendEmail.trim() || resending) return

    setResending(true)
    try {
      const res = await resendConfirmationEmail(resendEmail.trim())
      if (res.success) {
        toast.success(res.message || "Confirmation link sent! Please check your inbox.")
        setResendSent(true)
      } else {
        toast.error(res.error || "Failed to send confirmation link.")
      }
    } catch {
      toast.error("Failed to process request. Please try again.")
    } finally {
      setResending(false)
    }
  }

  const isSuccess = status === "success"

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E0D9CF] shadow-lg p-6 sm:p-10 text-center">
      {/* Brand Logo */}
      <div className="flex justify-center mb-6">
        <NextLink href="/" className="inline-block group">
          <Image 
            src="/logo.png" 
            alt="PrintBloom" 
            width={64} 
            height={64} 
            className="rounded-full shadow-sm group-hover:scale-105 transition-transform" 
          />
        </NextLink>
      </div>

      {isSuccess ? (
        <div>
          {/* Success Icon */}
          <div className="w-16 h-16 bg-[#2AAA5E]/10 border border-[#2AAA5E]/20 rounded-full flex items-center justify-center mx-auto mb-5 text-[#2AAA5E]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-[#2AAA5E] font-semibold bg-[#2AAA5E]/10 px-3 py-1 rounded-full">
            Email Confirmed
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#221F1C] mt-3 mb-2">
            Your PrintBloom Account is Ready
          </h1>

          <p className="text-sm sm:text-base text-[#6B6259] leading-relaxed mb-6 font-sans">
            Your email has been verified successfully. You can now create personalized memory keepsakes, track orders, and collect loyalty rewards.
          </p>

          {/* Device / Browser Guidance Note */}
          <div className="bg-[#FBF6EE] border border-[#E0D9CF] rounded-xl p-4 mb-6 text-left text-xs sm:text-sm text-[#6B6259] space-y-1.5">
            <p className="font-medium text-[#221F1C] flex items-center gap-1.5">
              <span>💡</span> Opened inside Gmail or your email app?
            </p>
            <p className="leading-relaxed">
              If you started on a computer or your regular mobile browser (Chrome/Safari), you can safely return there now and sign in. Your account is already activated.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {currentUser ? (
              <NextLink
                href={nextTarget}
                className="w-full bg-[#221F1C] text-white py-3.5 px-6 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <span>Continue to Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </NextLink>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal()}
                  className="w-full bg-[#221F1C] text-white py-3.5 px-6 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In in This Browser</span>
                </button>
                <NextLink
                  href="/products"
                  className="w-full bg-[#FBF6EE] hover:bg-[#F4ECDD] text-[#221F1C] border border-[#E0D9CF] py-3.5 px-6 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <span>Explore Keepsakes & Shop</span>
                </NextLink>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Expired / Invalid Icon */}
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-700">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-amber-700 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
            Link Notice
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#221F1C] mt-3 mb-2">
            Verification Link Expired or Already Used
          </h1>

          <p className="text-sm sm:text-base text-[#6B6259] leading-relaxed mb-6 font-sans">
            Confirmation links are valid for a single use. Your account might already be verified, or this link may have expired.
          </p>

          {/* Quick Sign In Option */}
          <button
            onClick={() => openAuthModal()}
            className="w-full bg-[#221F1C] text-white py-3.5 px-6 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-md mb-6"
          >
            <LogIn className="w-4 h-4" />
            <span>Try Signing In</span>
          </button>

          {/* Recovery Form: Request New Link */}
          <div className="pt-6 border-t border-[#E0D9CF] text-left">
            <h4 className="font-medium text-xs sm:text-sm text-[#221F1C] mb-1.5">
              Need a fresh confirmation link?
            </h4>
            <p className="text-xs text-[#9A8F85] mb-3">
              Enter your email and we'll send you a new activation link.
            </p>

            {resendSent ? (
              <div className="bg-[#2AAA5E]/10 border border-[#2AAA5E]/20 text-[#2AAA5E] rounded-lg p-3 text-xs">
                ✓ A fresh link has been requested. Please check your inbox and spam folder.
              </div>
            ) : (
              <form onSubmit={handleResend} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 border border-[#E0D9CF] rounded-sm px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#221F1C]"
                />
                <button
                  type="submit"
                  disabled={resending || !resendEmail.trim()}
                  className="bg-[#221F1C] text-white px-4 py-2 rounded-sm text-xs font-medium hover:bg-black transition-colors disabled:opacity-50 shrink-0"
                >
                  {resending ? "Sending..." : "Resend"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-8 pt-4 border-t border-[#E0D9CF]/60 flex items-center justify-between text-xs text-[#9A8F85]">
        <NextLink href="/" className="hover:text-[#221F1C] transition-colors">
          &larr; Back to PrintBloom
        </NextLink>
        <NextLink href="/faq" className="hover:text-[#221F1C] transition-colors">
          Need Help? Visit FAQ
        </NextLink>
      </div>
    </div>
  )
}

export default function VerifiedPage() {
  return (
    <main className="min-h-screen bg-[#FBF6EE] flex items-center justify-center py-16 px-4">
      <React.Suspense fallback={
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E0D9CF] p-10 text-center animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded max-w-xs mx-auto mb-2" />
          <div className="h-4 bg-gray-100 rounded max-w-sm mx-auto" />
        </div>
      }>
        <VerifiedContent />
      </React.Suspense>
    </main>
  )
}
