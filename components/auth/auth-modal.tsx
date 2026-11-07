"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { useUIStore } from "@/store/use-ui-store"
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function AuthModal() {
  const supabase = createSupabaseBrowserClient()
  const { isAuthModalOpen, closeAuthModal } = useUIStore()
  const searchParams = useSearchParams()
  const refCode = searchParams?.get('ref')
  
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(refCode ? "signup" : "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Unconfirmed email flow state
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  if (!isAuthModalOpen) return null

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setError("")
    setSuccess("")
    setIsEmailUnconfirmed(false)
    setUnverifiedEmail("")
  }

  const toggleMode = () => {
    setMode(mode === "login" || mode === "forgot" ? "signup" : "login")
    resetForm()
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    setError("")
    setSuccess("")
    setIsEmailUnconfirmed(false)
    setLoading(true)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/update-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Check your email for the password reset link.")
    }
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    const targetEmail = (unverifiedEmail || email).trim()
    if (!targetEmail || resendCooldown > 0 || resending) return

    setResending(true)
    setError("")
    try {
      const { resendConfirmationEmail } = await import("@/app/actions/auth")
      const result = await resendConfirmationEmail(targetEmail)

      if (!result.success) {
        toast.error(result.error || "Failed to resend confirmation email.")
      } else {
        toast.success(result.message || "Confirmation link sent! Please check your inbox.")
        setResendCooldown(60)
      }
    } catch {
      toast.error("Failed to resend confirmation email.")
    } finally {
      setResending(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsEmailUnconfirmed(false)
    setLoading(true)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/profile`,
          data: {
            full_name: name.trim(),
          },
        },
      })

      if (error) {
        if (error.message.includes("Password should contain")) {
          setError("Password must contain at least 6 characters, including uppercase, lowercase, numbers, and a special character.")
        } else {
          setError(error.message)
        }
      } else if (data.user?.identities?.length === 0) {
        setError("An account already exists with this email address.")
      } else {
        // Referral capture
        if (refCode && data.user) {
          try {
            const { data: referrerData } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', refCode.toUpperCase())
              .single()
              
            if (referrerData && referrerData.id !== data.user.id) {
              await supabase
                .from('profiles')
                .update({ referred_by: referrerData.id })
                .eq('id', data.user.id)
            }
          } catch (err) {
            console.error("Failed to process referral", err)
          }
        }
        
        // Show verification prompt
        setUnverifiedEmail(email.trim())
        setIsEmailUnconfirmed(true)
        setSuccess("We sent a confirmation link to your email. Please open it to activate your account.")
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        const errorMsg = (error.message || "").toLowerCase()
        const isNotConfirmed = 
          errorMsg.includes("email not confirmed") || 
          errorMsg.includes("not confirmed") || 
          (error as any).code === "email_not_confirmed"

        if (isNotConfirmed) {
          setIsEmailUnconfirmed(true)
          setUnverifiedEmail(email.trim())
          setError("")
        } else {
          setIsEmailUnconfirmed(false)
          setError("Invalid email or password.")
        }
      } else if (data.user) {
        closeAuthModal()
        resetForm()
        if (typeof window !== "undefined") {
          if (window.location.pathname.startsWith('/profile') || window.location.pathname === '/') {
            window.location.href = "/profile"
          } else {
            window.location.reload()
          }
        }
      }
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={closeAuthModal} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-6 pb-4 border-b border-[#E0D9CF] relative">
          <button 
            onClick={() => { closeAuthModal(); resetForm(); }} 
            className="absolute top-4 right-4 text-[#9A8F85] hover:text-[#DFBC94] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <img src="/logo.png" alt="PrintBloom" className="h-14 w-14 object-contain rounded-full shadow-sm mb-3" />
          <h2 className="font-serif text-2xl text-[#221F1C] text-center">
            {mode === "forgot" ? "Reset Password" : mode === "login" ? "Welcome Back" : "Join PrintBloom"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Dedicated Unverified Email Alert State */}
          {isEmailUnconfirmed && (
            <div className="bg-[#FBF6EE] border border-[#DFBC94] rounded-sm p-4 mb-5 text-[#221F1C]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#B57C2E] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-serif font-medium text-base text-[#221F1C] mb-1">
                    Please verify your email first
                  </h4>
                  <p className="text-xs text-[#6B6259] leading-relaxed mb-3">
                    We sent an activation link to <span className="font-medium text-[#221F1C]">{unverifiedEmail || email}</span>. Open it to activate your PrintBloom account.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-[#221F1C] text-white text-xs font-medium py-2 px-3 rounded-full hover:bg-black transition-colors text-center"
                    >
                      Open Gmail &rarr;
                    </a>
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resending || resendCooldown > 0}
                      className="inline-flex items-center justify-center bg-white border border-[#DFBC94] text-[#8B6B43] text-xs font-medium py-2 px-3 rounded-full hover:bg-[#F5F0E8] transition-colors disabled:opacity-50 text-center"
                    >
                      {resending ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation"}
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-[#9A8F85] mt-2.5">
                    Using another email provider? Check your usual inbox or spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && !isEmailUnconfirmed && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          {success && !isEmailUnconfirmed && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-sm mb-4 border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={mode === "forgot" ? handleForgotPassword : handleAuth} className="flex flex-col gap-4">
            
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#6B6259]">Full Name</label>
                <div className="flex relative">
                  <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#9A8F85]">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-12 pl-10 pr-4 border border-[#E0D9CF] rounded-sm focus:outline-none focus:border-[#DFBC94] bg-white transition-colors text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6B6259]">Email Address</label>
              <div className="flex relative">
                <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#9A8F85]">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-10 pr-4 border border-[#E0D9CF] rounded-sm focus:outline-none focus:border-[#DFBC94] bg-white transition-colors text-sm"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[#6B6259]">Password</label>
                  {mode === "login" && (
                    <button 
                      type="button" 
                      onClick={() => { setMode("forgot"); setError(""); setSuccess(""); setIsEmailUnconfirmed(false); }} 
                      className="text-xs text-[#DFBC94] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex relative">
                  <span className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#9A8F85]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-12 border border-[#E0D9CF] rounded-sm focus:outline-none focus:border-[#DFBC94] bg-white transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-[#9A8F85] hover:text-[#DFBC94] transition-colors"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-[#221F1C] text-white font-medium rounded-full hover:bg-[#DFBC94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Please wait..." : mode === "forgot" ? "Send Reset Link" : mode === "login" ? "Log In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#E0D9CF] pt-6 flex flex-col gap-2">
            {mode === "forgot" ? (
              <button 
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccess(""); setIsEmailUnconfirmed(false); }}
                className="text-[#DFBC94] text-sm font-medium hover:underline"
              >
                Back to log in
              </button>
            ) : (
              <>
                <p className="text-sm text-[#221F1C]">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button 
                  type="button"
                  onClick={toggleMode}
                  className="text-[#DFBC94] text-sm font-medium hover:underline"
                >
                  {mode === "login" ? "Create an account" : "Log in instead"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
