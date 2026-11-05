"use server"

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { ADMIN_EMAILS } from "@/lib/admin-config"
import { checkRateLimit, getIP } from "@/lib/rate-limit"
import { validatePhoneNumber } from "@/lib/phone-validation"

// Save enquiry to Supabase when user submits order form
export async function saveEnquiryAction(formData: FormData) {
  const ip = await getIP();
  if (!checkRateLimit(ip, "saveEnquiryAction").success) {
    return { error: "Too many requests. Please wait a minute." }
  }

  const supabase = await createSupabaseServerClient()

  // Get current user if logged in (for user panel requests)
  const { data: { user } } = await supabase.auth.getUser()

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const phoneValidation = validatePhoneNumber(phone)
  if (!phoneValidation.isValid) {
    return { error: phoneValidation.error || "Please enter a valid mobile number." }
  }
  const product = formData.get("product") as string
  const occasion = formData.get("occasion") as string
  const requiredBy = formData.get("requiredBy") as string
  const notes = formData.get("notes") as string
  const pages = formData.get("pages") as string
  const source = (formData.get("source") as string) || "marketing"

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .insert({
      name,
      phone: phoneValidation.normalized,
      source,
      user_id: user ? user.id : null,
      occasion,
      required_by: requiredBy || null,
      notes: notes || null,
      preferred_contact: "whatsapp",
      status: "new",
    })
    .select()
    .single()

  if (error || !enquiry) {
    console.error("Enquiry save error:", error)
    return { error: "Failed to save enquiry" }
  }

  // Find product id by slug
  const { data: productData } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product)
    .single()

  // Save enquiry item
  if (productData) {
    await supabase.from("enquiry_items").insert({
      enquiry_id: enquiry.id,
      product_id: productData.id,
      variant_label: pages ? `${pages} Pages` : null,
      quantity: 1,
    })
  }
  
  revalidatePath("/admin/enquiries")
  revalidatePath("/admin")

  return { success: true, enquiryId: enquiry.id }
}

// Fetch all enquiries for admin
export async function getEnquiries() {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return []

  const supabaseAdmin = await createSupabaseAdminClient()
  const { data, error } = await supabaseAdmin
    .from("enquiries")
    .select(`
      *,
      enquiry_items (
        variant_label,
        quantity,
        products ( name, slug )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fetch enquiries error details:", JSON.stringify(error, null, 2))
    return []
  }

  return data ?? []
}

// Update enquiry status
export async function updateEnquiryStatus(id: string, status: string) {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")

  const supabaseAdmin = await createSupabaseAdminClient()
  await supabaseAdmin.from("enquiries").update({ status }).eq("id", id)
  revalidatePath("/admin/enquiries")
}

// Fetch dashboard counts
export async function getDashboardCounts() {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return { newEnquiries: 0, activeProducts: 0, totalStories: 0 }

  const supabaseAdmin = await createSupabaseAdminClient()
  const [enquiries, products, stories] = await Promise.all([
    supabaseAdmin.from("enquiries").select("id", { count: "exact" }).eq("status", "new"),
    supabaseAdmin.from("products").select("id", { count: "exact" }).eq("status", "published"),
    supabaseAdmin.from("stories").select("id", { count: "exact" }),
  ])

  return {
    newEnquiries: enquiries.count ?? 0,
    activeProducts: products.count ?? 0,
    totalStories: stories.count ?? 0,
  }
}

// Fetch enquiry by token for the customer upload page
export async function getEnquiryByToken(token: string) {
  const supabase = await createSupabaseServerClient()

  // The upload_token column might not exist if the user hasn't run the migration yet,
  // but if they have, we can query it.
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, upload_status")
    .eq("upload_token", token)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateEnquiryNote(id: string, notes: string) {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  const { ADMIN_EMAILS } = await import("@/lib/admin-config")
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")

  const { createSupabaseAdminClient } = await import("@/lib/supabase-server")
  const supabaseAdmin = await createSupabaseAdminClient()

  const { error } = await supabaseAdmin
    .from("enquiries")
    .update({ notes })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/enquiries")
  return { success: true }
}

// Update upload status
export async function updateEnquiryUploadStatus(token: string, status: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from("enquiries").update({ upload_status: status }).eq("upload_token", token)
  revalidatePath("/admin/enquiries")
}

// Fetch uploaded files for a specific enquiry
export async function getEnquiryUploads(token: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase.storage.from("images").list(`customer_uploads/${token}`)
  
  if (error || !data || data.length === 0) {
    return { files: [] }
  }
  
  const images = data.filter(f => !f.name.endsWith('.json'))
  const jsonFiles = data.filter(f => f.name.endsWith('.json'))
  
  let captions: Record<string, string> = {}
  
  if (jsonFiles.length > 0) {
    // Get the most recent captions file
    const latestJson = jsonFiles.sort((a,b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())[0]
    const { data: fileData } = await supabase.storage.from("images").download(`customer_uploads/${token}/${latestJson.name}`)
    
    if (fileData) {
      const text = await fileData.text()
      try { 
        captions = JSON.parse(text) 
      } catch(e) {
        console.error("Failed to parse captions JSON", e)
      }
    }
  }
  
  // Generate public URLs and attach captions
  const files = images.map(img => {
    const path = `customer_uploads/${token}/${img.name}`
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(path)
    
    return {
      name: img.name,
      url: urlData.publicUrl,
      caption: captions[path] || null
    }
  })
  
  return { files }
}

// Hard delete all uploads for an enquiry to free up storage
export async function deleteEnquiryUploads(token: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // 1. List all files in the directory
  const { data: files, error: listError } = await supabase.storage.from("images").list(`customer_uploads/${token}`)
  
  if (listError || !files || files.length === 0) {
    return { success: false, error: "No files found to delete." }
  }
  
  // 2. Map to their full paths
  const filePaths = files.map(f => `customer_uploads/${token}/${f.name}`)
  
  // 3. Remove all files
  const { error: deleteError } = await supabase.storage.from("images").remove(filePaths)
  
  if (deleteError) {
    console.error("Error deleting files:", deleteError)
    return { success: false, error: deleteError.message }
  }
  
  // 4. Update the enquiry status so Admin knows it was cleared
  await supabase.from("enquiries").update({ upload_status: "archived" }).eq("upload_token", token)
  revalidatePath("/admin/enquiries")
  
  return { success: true }
}
