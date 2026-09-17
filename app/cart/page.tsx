"use client"
import { toast } from "sonner";
import * as React from "react"
import { useState } from "react"
import { useCart } from "@/store/use-cart"
import { Navbar } from "@/components/marketing/navbar"
import NextLink from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, CheckCircle2, Circle, MapPin, Plus, Tag } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useUIStore } from "@/store/use-ui-store"

type Step = "cart" | "address" | "payment"

export default function CartPage() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCart()
  const [currentStep, setCurrentStep] = useState<Step>("cart")
  const [isMounted, setIsMounted] = useState(false)
  
  // Address State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const supabase = createSupabaseBrowserClient()

  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const { openAuthModal } = useUIStore()
  
  // Points Redemption State
  const [availablePoints, setAvailablePoints] = useState(0)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  const handlePayment = async () => {
    if (!selectedAddressId) {
      toast.error("Please select an address before paying");
      setCurrentStep("address");
      return;
    }

    try {
      setIsProcessing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setIsProcessing(false);
        openAuthModal();
        return;
      }

      // Maximum Discount Ceiling
      let maxAllowedDiscount = 50;
      if (total >= 1000) {
        maxAllowedDiscount = 150;
      } else if (total >= 500) {
        maxAllowedDiscount = 100;
      }

      let discountAmount = 0;
      if (appliedPromo) {
        let rawDiscount = appliedPromo.type === 'percentage' 
          ? (total * appliedPromo.value) / 100 
          : appliedPromo.value;
        discountAmount = Math.min(rawDiscount, maxAllowedDiscount);
      }
      const orderTotalBeforePoints = Math.max(0, total + deliveryFee - discountAmount);
      
      const maxRedeemable = Math.min(availablePoints, maxAllowedDiscount);
      const finalPointsToRedeem = pointsToRedeem > maxRedeemable ? maxRedeemable : pointsToRedeem;
      
      const orderTotal = Math.max(0, orderTotalBeforePoints - finalPointsToRedeem);

      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            variant: item.variant,
            quantity: item.quantity,
            customization_data: item.customization_data || []
          })),
          addressId: selectedAddressId,
          appliedPromo: appliedPromo ? appliedPromo.code : null,
          pointsToRedeem: finalPointsToRedeem,
          marketingOptIn
        })
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok || !orderData.id) {
        throw new Error(orderData.error || "Could not create Razorpay order. Please try again.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PrintBloom",
        description: "Your Order",
        image: "/logo.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: items,
                amount: orderTotal,
                addressId: selectedAddressId
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              useCart.getState().clearCart();
              router.push("/profile?tab=orders&order_success=true");
            } else {
              toast.error("Payment verification failed: " + (verifyData.message || "Unknown DB error"));
            }
          } catch (err) {
            console.error(err);
            toast.error("Error verifying payment");
          }
        },
        prefill: { email: user.email, contact: "" },
        theme: { color: "#221F1C" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Checkout Failed:", error);
      toast.error(error.message || "Failed to initiate checkout");
    } finally {
      setIsProcessing(false);
    }
  }


  React.useEffect(() => {
    setIsMounted(true)
    
    // Fetch saved addresses if logged in
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch addresses
        const { data: addrData } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          
        if (addrData && addrData.length > 0) {
          setSavedAddresses(addrData)
          setSelectedAddressId(addrData[0].id)
        } else {
          setShowNewAddressForm(true)
        }

        // Fetch points balance
        const { data: pointsData } = await supabase
          .from("reward_points")
          .select("*")
          .eq("user_id", session.user.id)
          
        if (pointsData) {
          const balance = pointsData.reduce((acc, curr) => {
            if (curr.transaction_type === 'earned' || curr.transaction_type === 'refunded') return acc + curr.points;
            if (curr.transaction_type === 'redeemed') return acc - curr.points;
            return acc;
          }, 0);
          setAvailablePoints(balance);
        }
      } else {
        setShowNewAddressForm(true)
      }
    }
    fetchUserData()
  }, [])
  
  const total = getCartTotal()
  
  // Dynamic Delivery Fee
  const hasOnlyDigitalItems = items.length > 0 && items.every(item => item.is_digital === true || item.name?.includes("Softcopy Magazine"));
  const deliveryFee = hasOnlyDigitalItems ? 0 : 90;
  
  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{code: string, type: string, value: number} | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  
  // Maximum Discount Ceiling
  let maxAllowedDiscount = 50;
  if (total >= 1000) {
    maxAllowedDiscount = 150;
  } else if (total >= 500) {
    maxAllowedDiscount = 100;
  }

  let rawDiscountAmount = 0
  let discountAmount = 0
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      rawDiscountAmount = (total * appliedPromo.value) / 100
    } else {
      rawDiscountAmount = appliedPromo.value
    }
    discountAmount = Math.min(rawDiscountAmount, maxAllowedDiscount)
  }
  
  const isPromoCapped = appliedPromo && rawDiscountAmount > discountAmount;
  
  const orderTotal = Math.max(0, total + deliveryFee - discountAmount - pointsToRedeem)

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return
    setIsApplyingPromo(true)
    setPromoError(null)

    // Using fetch to an API route or server action
    try {
      const { validatePromoCode } = await import("@/app/actions/promo-codes")
      const res = await validatePromoCode(promoCodeInput)
      
      if (res.error) {
        setPromoError(res.error)
        setAppliedPromo(null)
      } else {
        setAppliedPromo({
          code: promoCodeInput.toUpperCase(),
          type: res.discount_type,
          value: res.discount_value
        })
        setPromoCodeInput("")
      }
    } catch (e) {
      setPromoError("Failed to apply promo code")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError(null)
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#FBF6EE] pt-28 pb-20">
        <Navbar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF6EE] pt-28 pb-20">
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />


      <div className="container mx-auto max-w-5xl px-4 md:px-8 mt-4">
        
        {/* Header / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="font-serif text-3xl text-[#221F1C]">The PrintBloom Store</div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center max-w-md mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 -z-10 -translate-y-1/2"></div>
          
          {/* Cart Step */}
          <div className="flex flex-col items-center flex-1 bg-[#FBF6EE]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === "cart" || currentStep === "address" || currentStep === "payment" ? "bg-[#2AAA5E] text-white" : "bg-white border-2 border-gray-300 text-gray-300"}`}>
              {currentStep !== "cart" ? <CheckCircle2 className="w-5 h-5" /> : "1"}
            </div>
            <span className="text-xs font-medium text-[#221F1C]">Cart</span>
          </div>

          {/* Address Step */}
          <div className="flex flex-col items-center flex-1 bg-[#FBF6EE]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === "address" || currentStep === "payment" ? "bg-[#2AAA5E] text-white" : "bg-white border-2 border-gray-300 text-gray-300"}`}>
              {currentStep === "payment" ? <CheckCircle2 className="w-5 h-5" /> : "2"}
            </div>
            <span className="text-xs font-medium text-gray-500">Address</span>
          </div>

          {/* Payment Step */}
          <div className="flex flex-col items-center flex-1 bg-[#FBF6EE]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === "payment" ? "bg-[#2AAA5E] text-white" : "bg-white border-2 border-gray-300 text-gray-300"}`}>
              3
            </div>
            <span className="text-xs font-medium text-gray-500">Payment</span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column (Forms / Items) */}
          <div className="flex-1">
            {currentStep === "cart" && (
              <div>
                <h2 className="font-serif text-2xl mb-6">Confirm Order</h2>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-6">
                  <span className="font-medium">Order Items</span>
                  <span className="text-sm font-medium">{items.length} Item{items.length !== 1 && 's'}</span>
                </div>
                
                {items.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">Your cart is empty.</p>
                    <NextLink href="/products" className="text-[#DFBC94] underline">Continue Shopping</NextLink>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-sm relative overflow-hidden border border-gray-200">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm text-[#221F1C]">{item.name}</h3>
                            {item.variant && <p className="text-xs text-gray-500 mt-1">{item.variant}</p>}
                            <p className="text-sm font-medium mt-1">₹{item.price}</p>
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <button onClick={() => removeItem(item.id)} className="flex items-center text-xs text-gray-500 hover:text-red-500 bg-gray-100 px-3 py-1.5 rounded-sm">
                              <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                            </button>
                            <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                              <span className="px-3 py-1 text-sm border-x border-gray-300 min-w-[40px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === "address" && (
              <div>
                <h2 className="font-serif text-2xl mb-6">Shipping Address</h2>
                
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="mb-6 space-y-3">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border rounded-sm cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[#221F1C] bg-[#F5F0E8]' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr.id ? 'border-[#DFBC94]' : 'border-gray-300'}`}>
                              {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#DFBC94]"></div>}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-[#221F1C]">{addr.full_name}</p>
                            <p className="text-sm text-gray-600 mt-1">{addr.address_line_1}, {addr.address_line_2 && addr.address_line_2 + ","} {addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-sm text-gray-600 mt-1 font-medium">Phone: {addr.phone_number}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-[#DFBC94] text-sm font-medium flex items-center gap-2 mt-4 hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add a new address
                    </button>
                  </div>
                )}

                {(!savedAddresses.length || showNewAddressForm) && (
                  <form className="space-y-5" onSubmit={async (e) => { 
                      e.preventDefault(); 
                      try {
                        const formData = new FormData(e.currentTarget);
                        
                        // Save address to DB if logged in
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session?.user) {
                          const { data, error } = await supabase.from('addresses').insert({
                            user_id: session.user.id,
                            full_name: formData.get("full_name"),
                            phone_number: formData.get("phone_number"),
                            pincode: formData.get("pincode"),
                            address_line_1: formData.get("address_line_1"),
                            address_line_2: formData.get("address_line_2"),
                            city: formData.get("city"),
                            state: formData.get("state"),
                            is_default: true
                          }).select().single();
                          
                          if (data) {
                            setSavedAddresses(prev => [data, ...prev]);
                            setSelectedAddressId(data.id);
                            setShowNewAddressForm(false);
                          } else {
                            // Fallback if error
                            setSelectedAddressId("temp-id");
                          }
                        } else {
                          // Allow guest to proceed to next step (will be prompted to login at payment)
                          setSelectedAddressId("temp-id");
                        }

                        const { saveFollowUpLead } = await import("@/app/actions/follow-ups")
                        await saveFollowUpLead(formData.get("full_name") as string, formData.get("phone_number") as string, total)
                      } catch(err) { console.error(err) }
                      setCurrentStep("payment"); 
                    }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[#221F1C]">New Address</h3>
                      {savedAddresses.length > 0 && (
                        <button type="button" onClick={() => setShowNewAddressForm(false)} className="text-sm text-gray-500 hover:text-black">Cancel</button>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Customer Name*</label>
                      <input required name="full_name" type="text" placeholder="Name" className="w-full border border-gray-300 rounded-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Mobile Number*</label>
                      <div className="flex">
                        <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-sm p-3 text-sm text-gray-600">+91</span>
                        <input required name="phone_number" type="tel" placeholder="Enter Input" className="flex-1 border border-gray-300 rounded-r-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Pincode*</label>
                      <div className="relative">
                        <input required name="pincode" type="text" placeholder="Eg. 410055" className="w-full border border-gray-300 rounded-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                        <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Address*</label>
                      <input required name="address_line_1" type="text" placeholder="Flat, House no., Building, Company" className="w-full border border-gray-300 rounded-sm p-3 mb-2 focus:outline-none focus:border-[#221F1C] text-sm" />
                      <input name="address_line_2" type="text" placeholder="Area, Street, Sector, Village" className="w-full border border-gray-300 rounded-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">City*</label>
                        <input required name="city" type="text" placeholder="City" className="w-full border border-gray-300 rounded-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">State*</label>
                        <input required name="state" type="text" placeholder="State" className="w-full border border-gray-300 rounded-sm p-3 focus:outline-none focus:border-[#221F1C] text-sm" />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#221F1C] text-white rounded-full py-4 font-medium hover:bg-black transition-colors mt-6">
                      Deliver to this address
                    </button>
                  </form>
                )}

                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <button 
                    onClick={async () => {
                      const addr = savedAddresses.find(a => a.id === selectedAddressId)
                      if (addr) {
                        try {
                          const { saveFollowUpLead } = await import("@/app/actions/follow-ups")
                          await saveFollowUpLead(addr.full_name, addr.phone_number, orderTotal)
                        } catch(err) { console.error(err) }
                      }
                      setCurrentStep("payment")
                    }}
                    disabled={!selectedAddressId}
                    className="w-full bg-[#221F1C] text-white rounded-full py-4 font-medium hover:bg-black transition-colors mt-6 disabled:opacity-50"
                  >
                    Deliver Here
                  </button>
                )}
              </div>
            )}

            {currentStep === "payment" && (
              <div>
                <h2 className="font-serif text-2xl mb-6">Payment Method</h2>
                <div className="border border-gray-200 rounded-sm p-4 flex items-start gap-3 bg-white cursor-pointer border-[#221F1C]">
                  <CheckCircle2 className="w-5 h-5 text-[#221F1C] mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">Pay Online</div>
                    <div className="text-xs text-gray-500 mt-1">Use UPI, Cards, Wallets or Net-banking</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-[#F6F6F6] rounded-sm p-6 border border-gray-200 sticky top-32">
              <h3 className="font-medium mb-6">Bill Details</h3>
              
              <div className="space-y-4 text-sm mb-6 border-b border-gray-200 pb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Item Total</span>
                  <span>₹{total}</span>
                </div>
                {appliedPromo && (
                  <>
                    <div className="flex justify-between text-green-700">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{appliedPromo.code}</span>
                      <button onClick={handleRemovePromo} className="text-[10px] text-red-500 underline ml-2">Remove</button>
                    </div>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  {isPromoCapped && (
                    <div className="text-[10px] text-amber-600 mt-1 flex justify-between bg-amber-50 p-1.5 rounded-sm">
                      <span>Maximum discount applied</span>
                    </div>
                  )}
                  </>
                )}
                
                {pointsToRedeem > 0 && (
                  <>
                    <div className="flex justify-between text-[#DFBC94]">
                    <div className="flex items-center gap-1">
                      <Circle className="w-3 h-3 fill-current" />
                      <span>Points Used</span>
                      <button onClick={() => setPointsToRedeem(0)} className="text-[10px] text-red-500 underline ml-2">Remove</button>
                    </div>
                    <span>-₹{pointsToRedeem.toFixed(2)}</span>
                  </div>
                  {pointsToRedeem === maxAllowedDiscount && pointsToRedeem < availablePoints && (
                    <div className="text-[10px] text-amber-600 mt-1 flex justify-between bg-amber-50 p-1.5 rounded-sm">
                      <span>Max discount limit reached</span>
                    </div>
                  )}
                </>
                )}
                
                {!hasOnlyDigitalItems && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span>₹{deliveryFee}</span>
                    </div>
                    <p className="text-[10px] text-[#9A8F85] italic leading-relaxed -mt-2">
                      📦 Note: Shipping charges may vary depending on the parcel's weight and size. If the actual shipping cost is higher than the estimated amount, an additional ₹30–₹50 may be applicable. We'll share the shipping receipt with you for transparency.
                    </p>
                  </>
                )}
              </div>

              {!appliedPromo && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    Have a Promo Code?
                  </label>
                  {pointsToRedeem > 0 ? (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-sm border border-gray-200 italic">
                      Promo codes cannot be combined with reward points.
                    </p>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. SAVE20"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#DFBC94]"
                        />
                        <button 
                          onClick={handleApplyPromo}
                          disabled={isApplyingPromo || !promoCodeInput.trim()}
                          className="bg-[#221F1C] text-white px-4 py-2 rounded-sm text-xs font-medium disabled:opacity-50 hover:bg-black transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                    </>
                  )}
                </div>
              )}

              {availablePoints > 0 && pointsToRedeem === 0 && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    PrintBloom Wallet
                  </label>
                  {appliedPromo ? (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-sm border border-gray-200 italic">
                      Reward points cannot be combined with promo codes.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-sm border border-gray-200">
                      <div>
                        <div className="text-sm font-medium">Available Balance</div>
                        <div className="text-xs text-[#DFBC94] font-bold">{availablePoints} Points (₹{availablePoints})</div>
                      </div>
                      <button 
                        onClick={() => {
                          const maxRedeemable = Math.min(availablePoints, maxAllowedDiscount);
                          setPointsToRedeem(maxRedeemable);
                        }}
                        className="text-xs font-medium bg-[#DFBC94] text-white px-3 py-1.5 rounded-sm hover:bg-[#c9a781] transition-colors"
                      >
                        Use Points
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between font-serif text-xl border-t border-gray-200 pt-6 mb-8 text-[#221F1C]">
                <span>Total Amount</span>
                <span>₹{Math.max(0, total + deliveryFee - discountAmount - pointsToRedeem).toFixed(2)}</span>
              </div>

              {currentStep === "cart" && (
                <button 
                  onClick={() => setCurrentStep("address")}
                  disabled={items.length === 0}
                  className="w-full bg-[#221F1C] text-white py-4 rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  Checkout
                </button>
              )}
              
              {currentStep === "payment" && (
                <>
                  <div className="mb-4 flex items-start gap-2 bg-[#FBF6EE] p-3 rounded-sm border border-gray-200">
                    <input 
                      type="checkbox" 
                      id="marketingOptIn" 
                      checked={marketingOptIn} 
                      onChange={(e) => setMarketingOptIn(e.target.checked)} 
                      className="mt-0.5 accent-[#221F1C] cursor-pointer" 
                    />
                    <label htmlFor="marketingOptIn" className="text-xs text-gray-700 cursor-pointer select-none leading-snug">
                      I'd like to receive PrintBloom offers and updates.
                    </label>
                  </div>
                  <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                    className="w-full bg-[#221F1C] text-white py-4 rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Pay Now"}
                  </button>
                </>
              )}

              <div className="mt-6 space-y-3">
                {[
                  "\"It felt worth every penny\"",
                  "\"Delivered before the deadline — wow!\"",
                  "\"Quality soo premium — better than I expected\"",
                ].map((quote, i) => (
                  <p key={i} className="text-[11px] text-[#9A8F85] text-center font-mono">{quote}</p>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
