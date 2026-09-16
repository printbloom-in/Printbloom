"use server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function addUserReminder(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("You must be logged in to add a reminder")
  }

  const { error } = await supabase.from("user_reminders").insert({
    user_id: user.id,
    person_name: formData.get("person_name") as string,
    event_type: formData.get("event_type") as string,
    event_date: formData.get("event_date") as string,
  })
  
  // Also insert into the public CRM `reminders` table so Admins can see it
  const customerName = user.user_metadata?.full_name || formData.get("person_name") as string
  const phoneNumber = user.user_metadata?.phone || "Registered User"
  
  const { createSupabaseAdminClient } = await import("@/lib/supabase-server")
  const supabaseAdmin = await createSupabaseAdminClient()
  
  await supabaseAdmin.from("reminders").insert({
    customer_name: customerName,
    phone_number: phoneNumber,
    occasion_name: formData.get("event_type") as string,
    occasion_date: formData.get("event_date") as string,
  })

  if (error) {
    console.error("Error adding user reminder:", error)
    throw new Error("Failed to add reminder")
  }

  revalidatePath("/profile")
  revalidatePath("/admin/reminders")
}

export async function deleteUserReminder(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not logged in")

  const { error } = await supabase
    .from("user_reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting user reminder:", error)
    throw new Error("Failed to delete reminder")
  }

  revalidatePath("/profile")
  revalidatePath("/admin/reminders")
}
