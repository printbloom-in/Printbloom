import * as React from "react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Navbar } from "@/components/marketing/navbar"
import { User, Package, MapPin, Heart, ArrowRight, Wallet, CalendarDays, MessageSquare, LayoutDashboard } from "lucide-react"
import { SignOutButton } from "@/components/auth/signout-button"
import NextLink from "next/link"
import { OrderHistory } from "@/components/profile/order-history"
import { AddressBook } from "@/components/profile/address-book"
import { WalletRewards } from "@/components/profile/wallet-rewards"
import { SmartReminders } from "@/components/profile/smart-reminders"
import { WishlistTab } from "@/components/profile/wishlist-tab"
import { EnquiryTab } from "@/components/profile/enquiry-tab"
import { ProfileInfoTab } from "@/components/profile/profile-info-tab"
import { DashboardTab } from "@/components/profile/dashboard-tab"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { OrderSuccessPopup } from "@/components/profile/order-success-popup"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || "dashboard"
  const fullName = user.user_metadata?.full_name || "PrintBloom User"

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`*, order_items (*)`)
    .eq("user_id", user.id)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })

  const { getProducts } = await import("@/app/actions/products");
  const products = await getProducts();
  
  const enrichedOrders = orders?.map(order => ({
    ...order,
    order_items: order.order_items?.map((item: any) => ({
      ...item,
      image_url: products.find((p: any) => 
        p.id === item.product_id || 
        p.slug === item.product_id || 
        (item.product_id && p.id && p.id.startsWith(item.product_id)) ||
        (item.product_id && p.id && item.product_id.startsWith(p.id)) ||
        (item.product_id && p.slug && item.product_id.startsWith(p.slug))
      )?.main_image_url || null
    }))
  }))

  // Fetch addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch points history
  const { data: pointsHistory } = await supabase
    .from("reward_points")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch reminders
  const { data: reminders } = await supabase
    .from("user_reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: true })

  // Fetch wishlist
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-[#FBF6EE] pt-24 md:pt-28 pb-16 md:pb-20">
      <Navbar />
      <Suspense fallback={null}>
        <OrderSuccessPopup />
      </Suspense>
      
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        
        <h1 className="font-serif text-3xl md:text-4xl text-[#221F1C] mb-6 md:mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-4 md:gap-6">
              
              {/* User Info Card */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex items-center gap-4 border border-[#E0D9CF]">
                <AvatarUpload currentAvatar={user.user_metadata?.avatar_url} fullName={fullName} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#221F1C] truncate">{fullName}</h3>
                  <p className="text-xs text-[#9A8F85] truncate">{user.email}</p>
                </div>
              </div>

              {/* Navigation Links: 2-column grid on mobile, vertical list on desktop */}
              <div className="grid grid-cols-2 md:flex md:flex-col gap-2 md:gap-1">
                <NextLink 
                  href="/profile?tab=dashboard" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "dashboard" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Dashboard</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=profile" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "profile" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <User className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Profile Info</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=orders" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "orders" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <Package className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">My Orders</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=addresses" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "addresses" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Addresses</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=rewards" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "rewards" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <Wallet className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Wallet & Rewards</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=reminders" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "reminders" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <CalendarDays className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Reminders</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=wishlist" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "wishlist" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Wishlist</span>
                </NextLink>

                <NextLink 
                  href="/profile?tab=enquiry" 
                  className={`flex items-center gap-2.5 px-3 py-2.5 md:py-3 md:px-4 rounded-xl transition-all ${currentTab === "enquiry" ? "bg-[#221F1C] text-white md:bg-white md:text-[#221F1C] md:shadow-sm md:border md:border-[#E0D9CF] md:font-medium" : "bg-white border border-[#E0D9CF] md:border-transparent md:bg-transparent text-[#6B6259] hover:bg-[#F4ECDD]"}`}
                >
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> 
                  <span className="text-xs md:text-base font-medium truncate">Custom Request</span>
                </NextLink>
              </div>
              
              <div className="px-1 md:px-4">
                <SignOutButton />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[500px]">
            
            {currentTab === "dashboard" && (
              <DashboardTab 
                fullName={fullName} 
                orders={orders || []} 
                pointsHistory={pointsHistory || []} 
                reminders={reminders || []}
                wishlist={wishlist || []}
                createdAt={user.created_at}
              />
            )}
            
            {currentTab === "profile" && (
              <ProfileInfoTab user={user} />
            )}

            {currentTab === "orders" && (
              <OrderHistory orders={enrichedOrders || []} />
            )}

            {currentTab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0D9CF] shadow-sm animate-in fade-in duration-500">
                <AddressBook addresses={addresses || []} />
              </div>
            )}

            {currentTab === "rewards" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0D9CF] shadow-sm animate-in fade-in duration-500">
                <WalletRewards pointsHistory={pointsHistory || []} userId={user.id} />
              </div>
            )}

            {currentTab === "reminders" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0D9CF] shadow-sm animate-in fade-in duration-500">
                <SmartReminders reminders={reminders || []} />
              </div>
            )}

            {currentTab === "wishlist" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0D9CF] shadow-sm animate-in fade-in duration-500">
                <WishlistTab items={wishlist || []} />
              </div>
            )}
            
            {currentTab === "enquiry" && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E0D9CF] shadow-sm animate-in fade-in duration-500">
                <EnquiryTab />
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
