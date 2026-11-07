import * as React from "react"
import { SectionHeading } from "@/components/ui/section-heading"
import { Button } from "@/components/ui/button"
import { TextPressure } from "@/components/ui/text-pressure"

export function FinalCTASection() {
  return (
    <section className="relative pt-20 md:pt-32 pb-12 md:pb-16 px-4 md:px-8 bg-[#D99F6C] text-white overflow-hidden flex flex-col items-center">
      <div className="container mx-auto max-w-4xl text-center flex flex-col items-center relative z-10 mb-16">
        <SectionHeading as="h2" className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl">
          Want Something Custom?
        </SectionHeading>
        <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Have a different idea or a custom request? Tell us what you need, and we'll help you create it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="bg-[#221F1C] text-[#FBF6EE] hover:bg-[#1A1815] border-none text-base h-14 px-8 rounded-sm">
            <a href="/order">Request a Custom Order</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white border-2 text-white hover:bg-white hover:text-[#221F1C] bg-transparent text-base h-14 px-8 rounded-sm font-medium">
            <a href="/how-it-works">See How It Works</a>
          </Button>
        </div>
      </div>

      <div className="w-full h-[20vw] min-h-[120px] max-h-[300px] mt-auto select-none pointer-events-auto opacity-30">
        <TextPressure
          text="PRINTBLOOM"
          flex={true}
          alpha={false}
          stroke={false}
          width={true}
          weight={true}
          italic={true}
          textColor="#FBF6EE"
          minFontSize={36}
        />
      </div>
    </section>
  )
}
