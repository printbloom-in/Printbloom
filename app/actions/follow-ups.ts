"use server"

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { ADMIN_EMAILS } from "@/lib/admin-config"
import { validatePhoneNumber } from "@/lib/phone-validation"
import { checkDistributedRateLimit, getIP } from "@/lib/rate-limit"

export async function saveFollowUpLead(customer_name: string, phone_number: string, cart_total: number) {
  // 1. Distributed Server-side Rate Limiting (Upstash Redis with memory fallback)
  const ip = await getIP()
  const rateLimit = await checkDistributedRateLimit(ip, "lead")
  if (!rateLimit.success) {
    return { success: false, error: "Too many requests. Please try again later." }
  }

  // 2. Strict Phone Validation (rejects 0000000000, 1111111111, invalid digits)
  const phoneValidation = validatePhoneNumber(phone_number)
  if (!phoneValidation.isValid) {
    return { success: false, error: phoneValidation.error || "Invalid mobile number." }
  }
  const cleanPhone = phoneValidation.normalized

  // 3. Name validation
  const cleanName = (customer_name || "").trim().slice(0, 100)
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Customer name is required." }
  }

  const supabase = await createSupabaseServerClient()
  
  // Check if a pending lead for this phone number already exists in the last 24h
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const { data: existing } = await supabase
    .from("follow_ups")
    .select("id")
    .eq("phone_number", cleanPhone)
    .eq("status", "pending")
    .gte("created_at", yesterday.toISOString())
    .single()
    
  if (existing) {
    // Just update the cart total if it changed
    await supabase.from("follow_ups").update({ cart_total }).eq("id", existing.id)
    return { success: true }
  }

  // Create new lead with clean validated data
  const { error: insertError } = await supabase.from("follow_ups").insert({
    customer_name: cleanName,
    phone_number: cleanPhone,
    cart_total,
    status: "pending"
  })
  
  if (insertError) {
    console.error("❌ Follow-up insert failed:", JSON.stringify(insertError))
    return { success: false, error: insertError.message }
  }
  
  return { success: true }
}

export async function getFollowUps() {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return []

  const supabaseAdmin = await createSupabaseAdminClient()
  const { data, error } = await supabaseAdmin
    .from("follow_ups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching follow-ups:", error)
    return []
  }

  return data || []
}

export async function updateFollowUpStatus(id: string, status: "pending" | "contacted" | "recovered") {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return { error: "Unauthorized" }

  const supabaseAdmin = await createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from("follow_ups")
    .update({ status })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/follow-ups")
  return { success: true }
}
