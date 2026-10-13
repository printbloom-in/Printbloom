import * as React from "react"

export interface ProcessConfig {
  title: string;
  steps: string[];
}

export function getProductProcess(slug: string): ProcessConfig {
  if (slug === "softcopy-magazine") {
    return {
      title: "How Your Digital Magazine Is Made",
      steps: [
        "Place your order",
        "We contact you on WhatsApp",
        "Send us your photos and memories",
        "We create your magazine design",
        "We send you a preview",
        "You approve the design",
        "We prepare the final digital magazine",
        "You receive it digitally"
      ]
    };
  }

  if (slug.includes("magazine")) {
    return {
      title: "How Your Magazine Is Made",
      steps: [
        "Place your order",
        "We contact you on WhatsApp",
        "Send us your photos and memories",
        "We create your magazine design",
        "We send you a preview",
        "You approve the design",
        "We print your magazine",
        "We carefully pack and ship it"
      ]
    };
  }

  if (slug === "photo-frames") {
    return {
      title: "How Your Frame Is Made",
      steps: [
        "Place your order",
        "We contact you on WhatsApp",
        "Send your photo and customisation details",
        "We prepare your design",
        "You approve it where applicable",
        "We create your frame",
        "We pack and ship it"
      ]
    };
  }

  if (slug === "polaroids") {
    return {
      title: "How Your Polaroids Are Made",
      steps: [
        "Place your order",
        "We contact you on WhatsApp",
        "Send your photos",
        "We prepare the Polaroid layout",
        "You approve it where applicable",
        "We print your memories",
        "We pack and ship them"
      ]
    };
  }

  if (slug === "spotify-cards") {
    return {
      title: "How Your Spotify Card Is Made",
      steps: [
        "Place your order",
        "Share your photo and song details",
        "We personalise your card",
        "We confirm the design/details where applicable",
        "We create your card",
        "We pack and ship it"
      ]
    };
  }

  // Default process for other products (Calendar, Keychains, Strips, Magnets, Newspaper)
  return {
    title: "How The Process Works",
    steps: [
      "Place your order",
      "We contact you on WhatsApp",
      "Share your photos and customisation details",
      "We prepare your personalised design",
      "You approve it where applicable",
      "We produce your gift with care",
      "We pack and ship it directly to you"
    ]
  };
}

export function HowItWorksSteps({ slug }: { slug?: string }) {
  const process = getProductProcess(slug || "");

  return (
    <div className="mt-24 pt-16 border-t border-[#E4D9C6]">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl text-[#221F1C] mb-4">{process.title}</h2>
        <p className="text-[#6B6259] max-w-2xl mx-auto text-sm md:text-base">
          Simple, personal, and stress-free. We guide you every step of the way after your order is confirmed.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {process.steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-center bg-white p-5 rounded-sm border border-[#E4D9C6] shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-[#DFBC94]/20 text-[#DFBC94] rounded-full flex items-center justify-center font-medium border border-[#DFBC94]/30 text-sm">
                {idx + 1}
              </div>
              <p className="text-[#221F1C] text-sm font-medium leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
