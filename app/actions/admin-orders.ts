"use server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function getAdminOrders() {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  const { ADMIN_EMAILS } = await import("@/lib/admin-config")
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")

  const { createSupabaseAdminClient } = await import("@/lib/supabase-server")
  const supabaseAdmin = await createSupabaseAdminClient()

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin orders:", error)
    return []
  }

  if (!data || data.length === 0) return []

  // Fetch addresses separately
  const addressIds = data.map((o: any) => o.shipping_address_id).filter(Boolean)
  let addressesMap: Record<string, any> = {}
  
  if (addressIds.length > 0) {
    const { data: addressesData, error: addressError } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .in("id", addressIds)
      
    if (!addressError && addressesData) {
      addressesMap = addressesData.reduce((acc: any, addr: any) => {
        acc[addr.id] = addr
        return acc
      }, {})
    }
  }

  // Attach addresses to orders
  const ordersWithAddresses = data.map((order: any) => ({
    ...order,
    addresses: order.shipping_address_id ? [addressesMap[order.shipping_address_id]] : []
  }))

  return ordersWithAddresses
}

export async function getAdminOrderById(id: string) {
  const supabaseUser = await createSupabaseServerClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  const { ADMIN_EMAILS } = await import("@/lib/admin-config")
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")

  const { createSupabaseAdminClient } = await import("@/lib/supabase-server")
  const supabaseAdmin = await createSupabaseAdminClient()

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching order details:", error.message || error)
    return null
  }

  // Fetch address separately
  let addr = null
  if (data.shipping_address_id) {
    const { data: addressData } = await supabaseAdmin
      .from("addresses")
      .select("*")
      .eq("id", data.shipping_address_id)
      .single()
    addr = addressData
  }
  
  // Attach address back onto data as it was expected by the UI
  data.addresses = addr ? [addr] : []

  // Extract customer info from address if possible
  const customerEmail = data.user_email || "Provided at checkout"
  const customerName = addr?.full_name || data.customer_name || "Unknown Customer"
  const customerPhone = addr?.phone_number || data.customer_phone || ""

  return { ...data, user_email: customerEmail, customer_name: customerName, customer_phone: customerPhone }
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { ADMIN_EMAILS } = await import("@/lib/admin-config")
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")
  
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)

  if (error) {
    console.error("Failed to update order status:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
  return { success: true }
}

export async function updateImagesStatus(id: string, images_status: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { ADMIN_EMAILS } = await import("@/lib/admin-config")
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) throw new Error("Unauthorized")
  
  const { error } = await supabase
    .from("orders")
    .update({ images_status })
    .eq("id", id)

  if (error) {
    console.error("Failed to update images status:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
  return { success: true }
}
