"use server"

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { ADMIN_EMAILS } from "@/lib/admin-config"
import { revalidatePath } from "next/cache"
import { checkRateLimit, getIP } from "@/lib/rate-limit"

export async function saveReminder(formData: FormData) {
  const ip = await getIP();
  if (!checkRateLimit(ip, "saveReminder").success) {
    return { success: false, error: "Too many requests. Please wait a minute." }
  }

  const customerName = formData.get("customer_name") as string
  const phoneNumber = formData.get("phone_number") as string
  const occasionName = formData.get("occasion_name") as string
  const occasionDate = formData.get("occasion_date") as string // Format: YYYY-MM-DD

  if (!customerName || !phoneNumber || !occasionName || !occasionDate) {
    return { success: false, error: "All fields are required." }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Save to the Admin CRM (Current behavior for everyone)
  const { error } = await supabase
    .from("reminders")
    .insert([{ 
      customer_name: customerName, 
      phone_number: phoneNumber,
      occasion_name: occasionName,
      occasion_date: occasionDate
    }])
    
  if (error) {
    console.error("Error saving reminder:", error)
    return { success: false, error: error.message }
  }

  // 2. If user is logged in, ALSO save to their personal dashboard
  if (user) {
    await supabase.from("user_reminders").insert({
      user_id: user.id,
      person_name: occasionName, // Mapping the public field to the private field
      event_type: "other",       // Defaulting to "other" or mapping logic
      event_date: occasionDate
    })
    revalidatePath("/profile")
  }
  
  revalidatePath("/admin/reminders")
  return { success: true }
}

export async function getUpcomingReminders(daysAhead: number = 20) {
  const supabaseAdmin = await createSupabaseAdminClient()
  
  const { data, error } = await supabaseAdmin.from("reminders").select("*")
  
  if (error || !data) {
    return []
  }
  
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysAhead)
  const targetMonth = targetDate.getMonth()
  const targetDay = targetDate.getDate()
  const currentYear = new Date().getFullYear()
  
  const upcoming = data.filter(reminder => {
    if (!reminder.occasion_date) return false;
    // Hide if already notified this year
    if (reminder.last_notified_year === currentYear) return false;
    
    const rDate = new Date(reminder.occasion_date)
    return rDate.getMonth() === targetMonth && rDate.getDate() === targetDay
  })
  
  return upcoming
}



export async function markReminderSent(id: string) {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    return { success: false, error: "Unauthorized" }
  }

  const supabaseAdmin = await createSupabaseAdminClient()
  const currentYear = new Date().getFullYear()
  
  const { error } = await supabaseAdmin.from("reminders").update({
    last_notified_year: currentYear
  }).eq("id", id)

  if (error) {
    console.error("Error marking reminder sent:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/reminders")
  return { success: true }
}

export async function getAllReminders() {
  const supabaseAdmin = await createSupabaseAdminClient()
  const { data } = await supabaseAdmin.from("reminders").select("*").order("created_at", { ascending: false })
  return data || []
}
