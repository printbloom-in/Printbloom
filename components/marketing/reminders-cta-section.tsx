import { SectionHeading } from "@/components/ui/section-heading"
import { FadeIn } from "@/components/ui/fade-in"
import NextLink from "next/link"

export function RemindersCTASection() {
  return (
    <section className="py-14 md:py-24 bg-[#E0D9CF] border-y border-[#DFBC94]/20 relative overflow-hidden">
      {/* Decorative floral accent */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" fill="#DFBC94"/>
        </svg>
      </div>

      <div className="container mx-auto max-w-4xl px-4 md:px-8 relative z-10 text-center">
        <FadeIn>
          <span className="text-[#9A8F85] font-mono text-[10px] tracking-widest uppercase mb-4 block font-semibold">
            Plan Ahead
          </span>
          <SectionHeading as="h2" className="text-[#221F1C] mb-6">
            Never Miss a Special Day Again
          </SectionHeading>
          <p className="text-lg text-[#6B6259] leading-relaxed max-w-2xl mx-auto mb-10">
            Between work and life, it's easy to forget anniversaries and birthdays until the last minute. 
            Tell us your important dates, and we'll send you a gentle WhatsApp reminder 20 days in advance 
            so you can design a thoughtful custom gift.
          </p>
          <NextLink 
            href="/reminders"
            className="inline-flex items-center gap-2 bg-[#221F1C] text-white px-8 py-4 rounded-sm hover:bg-black transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>🔔</span> Set a Free Reminder
          </NextLink>
        </FadeIn>
      </div>
    </section>
  )
}
