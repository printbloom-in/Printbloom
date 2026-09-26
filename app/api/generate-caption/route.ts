import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize Gemini SDK. Wait for key to be present.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

import { getRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rateLimiter = getRateLimiter();
    if (rateLimiter) {
      const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
      const { success } = await rateLimiter.limit(ip);
      
      if (!success) {
        console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} on /api/generate-caption`);
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is not configured." }, { status: 500 })
    }

    const { imageBase64, mimeType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // We use gemini-3.6-flash as per the API's recommendation for new users
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" })

    const prompt = `
      You are an expert copywriter for a custom gifting brand called PrintBloom.
      Analyze this image carefully. Write 3 short, emotional, or funny captions suitable for printing under this photo in a memory book or polaroid.
      
      Rules:
      1. Keep each caption under 8-10 words.
      2. Match the mood of the photo (e.g. romantic, funny, nostalgic).
      3. Return exactly 3 options, separated by the character '|' (pipe), with NO extra text, no markdown, no quotes, no numbering. 
      Example output: Best day ever!|Memories for a lifetime|Look at those smiles
    `

    // Clean base64 string if it contains the data URI scheme
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "")

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/jpeg"
        }
      }
    ]

    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()

    // Parse the 3 options
    const options = text.split("|").map(s => s.trim()).filter(Boolean)

    return NextResponse.json({ captions: options })
  } catch (error: any) {
    console.error("Gemini AI Error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate captions" }, { status: 500 })
  }
}
