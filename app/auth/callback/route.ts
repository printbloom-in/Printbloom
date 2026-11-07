import { NextResponse, type NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as any
  const next = requestUrl.searchParams.get("next") || "/profile"

  // Prevent open redirect: target must be a relative URL starting with / and not //
  const isSafeRelative = next.startsWith("/") && !next.startsWith("//")
  const safeNext = isSafeRelative ? next : "/profile"

  const supabase = await createSupabaseServerClient()

  // 1. Handle PKCE code flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const destination = new URL("/auth/verified", requestUrl.origin)
      destination.searchParams.set("status", "success")
      if (safeNext && safeNext !== "/profile") {
        destination.searchParams.set("next", safeNext)
      }
      return NextResponse.redirect(destination)
    }
    console.error("Auth callback code exchange error:", error.message)
  }

  // 2. Handle OTP / token_hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const destination = new URL("/auth/verified", requestUrl.origin)
      destination.searchParams.set("status", "success")
      if (safeNext && safeNext !== "/profile") {
        destination.searchParams.set("next", safeNext)
      }
      return NextResponse.redirect(destination)
    }
    console.error("Auth callback OTP verification error:", error.message)
  }

  // 3. Fallback for expired, invalid, or already-used links
  const fallback = new URL("/auth/verified", requestUrl.origin)
  fallback.searchParams.set("status", "error")
  return NextResponse.redirect(fallback)
}
