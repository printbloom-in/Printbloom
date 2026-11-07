"use server"

import { createSupabaseServerClient } from "@/lib/supabase-server"
import { getIP, checkDistributedRateLimit } from "@/lib/rate-limit"

export async function resendConfirmationEmail(email: string) {
  const ip = await getIP()
  
  // 1. Server-side Rate Limiting (anti-abuse via Upstash Redis)
  const rateLimit = await checkDistributedRateLimit(ip, "resend")
  if (!rateLimit.success) {
    return { 
      success: false, 
      error: "Too many confirmation requests. Please wait a few minutes before trying again." 
    }
  }

  const cleanEmail = (email || "").trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, error: "Please enter a valid email address." }
  }

  const supabase = await createSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.printbloom.in"

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/profile`,
      },
    })

    if (error) {
      console.warn("Supabase resend confirmation notice:", error.message)
      if (error.message.includes("rate limit") || (error as any).status === 429) {
        return { 
          success: false, 
          error: "Please wait before requesting another confirmation email." 
        }
      }
    }

    // Generic safe response to prevent email enumeration
    return { 
      success: true, 
      message: "If an account exists with this email, a confirmation link has been sent." 
    }
  } catch (err) {
    console.error("Resend confirmation exception:", err)
    return { 
      success: false, 
      error: "Unable to process request. Please try again later." 
    }
  }
}
