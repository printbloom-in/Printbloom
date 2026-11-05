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

  // Handle PKCE code flow (e.g. from standard magic link / email link with code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const destination = new URL(safeNext, requestUrl.origin)
      destination.searchParams.set("verified", "true")
      return NextResponse.redirect(destination)
    }
    console.error("Auth callback code exchange error:", error.message)
  }

  // Handle OTP / token_hash flow (e.g. from custom verification links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const destination = new URL(safeNext, requestUrl.origin)
      destination.searchParams.set("verified", "true")
      return NextResponse.redirect(destination)
    }
    console.error("Auth callback OTP verification error:", error.message)
  }

  // If verification failed or expired, redirect gracefully with an informative flag
  const fallback = new URL("/profile", requestUrl.origin)
  fallback.searchParams.set("auth_error", "verification_failed")
  return NextResponse.redirect(fallback)
}
