"use client"
import * as React from "react"
import { useState } from "react"
import { useUIStore } from "@/store/use-ui-store"
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useSearchParams } from "next/navigation"

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

  if (!isAuthModalOpen) return null

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setError("")
    setSuccess("")
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          }
        }
      })

      if (error) {
        if (error.message.includes("Password should contain")) {
          setError("Password must contain at least 6 characters, including uppercase, lowercase, numbers, and a special character.")
        } else {
          setError(error.message)
        }
      } else if (data.user?.identities?.length === 0) {
        setError("User already exists with this email address.")
      } else {
        // Referral capture limitation: Only captures if they sign up immediately with the ref link
        if (refCode && data.user) {
          try {
            // Find referrer by code
            const { data: referrerData } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', refCode.toUpperCase())
              .single();
              
            if (referrerData && referrerData.id !== data.user.id) {
              // Update new user's profile with referred_by
              await supabase
                .from('profiles')
                .update({ referred_by: referrerData.id })
                .eq('id', data.user.id);
            }
          } catch (err) {
            console.error("Failed to process referral", err);
          }
        }
        
        setSuccess("Account created successfully! You can now log in.")
        setMode("login")
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setError("Invalid email or password.")
      } else if (data.user) {
        // Success!
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
          <button onClick={() => { closeAuthModal(); resetForm(); }} className="absolute top-4 right-4 text-[#9A8F85] hover:text-[#DFBC94] transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <img src="/logo.png" alt="PrintBloom" className="h-14 w-14 object-contain rounded-full shadow-sm mb-3" />
          <h2 className="font-serif text-2xl text-[#221F1C] text-center">
            {mode === "forgot" ? "Reset Password" : mode === "login" ? "Welcome Back" : "Join PrintBloom"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm mb-4 border border-red-100">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-sm mb-4 border border-green-100">
              {success}
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
                      onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }} 
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
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
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
