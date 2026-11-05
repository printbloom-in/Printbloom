"use server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { validatePhoneNumber } from "@/lib/phone-validation"

export async function addAddress(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("You must be logged in to add an address")
  }

  const rawPhone = formData.get("phone_number") as string
  const phoneValidation = validatePhoneNumber(rawPhone)
  if (!phoneValidation.isValid) {
    throw new Error(phoneValidation.error || "Please enter a valid 10-digit mobile number")
  }

  const newAddress = {
    user_id: user.id,
    full_name: formData.get("full_name") as string,
    phone_number: phoneValidation.normalized,
    address_line_1: formData.get("address_line_1") as string,
    address_line_2: (formData.get("address_line_2") as string) || "",
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    pincode: formData.get("pincode") as string,
    is_default: false
  }

  const { error } = await supabase.from("addresses").insert(newAddress)
  
  if (error) {
    console.error("Error adding address:", error)
    throw new Error("Failed to add address")
  }

  revalidatePath("/profile")
  revalidatePath("/cart")
}

export async function deleteAddress(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not logged in")

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting address:", error)
    throw new Error("Failed to delete address")
  }

  revalidatePath("/profile")
  revalidatePath("/cart")
}
