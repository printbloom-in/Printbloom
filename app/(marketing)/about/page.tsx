import * as React from "react"
import { Metadata } from "next"
import NextLink from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About PrintBloom | Personalised Gifts Made from Memories",
  description: "Discover PrintBloom, where your photographs, stories and favourite moments become personalised gifts and keepsakes worth holding on to.",
}

export default function AboutPage() {
  return (
    <main className="flex-1 bg-[#FBF6EE] pt-32 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Section 1: Hero */}
        <section className="text-center mb-16 md:mb-20">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-[#DFBC94] mb-4 bg-[#DFBC94]/10 px-3.5 py-1.5 rounded-full border border-[#DFBC94]/20">
            A LITTLE ABOUT PRINTBLOOM
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#221F1C] tracking-tight leading-tight max-w-2xl mx-auto mb-6">
            Some memories deserve more than a place in your camera roll.
          </h1>
          <p className="text-base sm:text-lg text-[#6B6259] max-w-xl mx-auto leading-relaxed">
            A little about why PrintBloom exists, and the memories we're here to help you keep.
          </p>
        </section>

        {/* Feature Image */}
        <div className="relative w-full h-[280px] sm:h-[400px] md:h-[460px] rounded-2xl overflow-hidden mb-16 md:mb-24 shadow-sm border border-[#E0D9CF]">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="PrintBloom memories and keepsake gifts"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Editorial Story Layout */}
        <div className="space-y-16 md:space-y-20 max-w-3xl mx-auto">
          
          {/* Section 2: It usually starts with a memory */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-10 md:p-12 border border-[#E0D9CF] shadow-xs">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#221F1C] mb-6">
              It usually starts with a memory
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-[#6B6259] leading-relaxed font-sans">
              <p>
                Think about the last time you scrolled far back through your gallery.
              </p>
              <p>
                Maybe you found a picture with your best friend that made you laugh all over again. Maybe it was a day you wish you could relive, a person you miss, or a moment you didn't realise would mean so much later.
              </p>
              <p>
                You probably took that picture without thinking much about it. But now, it means something.
              </p>
              <p>
                And that's the thing about memories. Sometimes, we don't realise how precious they are until we look back.
              </p>
              <p>
                Our phones are filled with photographs, conversations, birthdays, silly moments and little pieces of our lives. We save them, promise ourselves we'll look at them again, and then keep scrolling.
              </p>
              <p className="font-serif text-xl sm:text-2xl text-[#221F1C] pt-4 italic border-t border-[#E0D9CF]/60">
                We wanted to give those memories a place outside the screen.
              </p>
            </div>
          </section>

          {/* Section 3: More than just a gift */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-10 md:p-12 border border-[#E0D9CF] shadow-xs">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#221F1C] mb-6">
              More than just a gift
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-[#6B6259] leading-relaxed font-sans">
              <p>
                At PrintBloom, we believe the best gifts aren't always the biggest or the most expensive.
              </p>
              <p className="italic text-[#221F1C]">
                Sometimes, they're the ones that make someone pause, smile and say, &ldquo;You remembered this?&rdquo;
              </p>
              <p>
                The photograph from that one day. The song that reminds you of each other. The inside joke nobody else understands. The memories that might seem ordinary to everyone else, but mean the world to you.
              </p>
              <p>
                Those are the things that make a gift personal.
              </p>
              <p>
                That's why we create personalised magazines, photo frames, Polaroids and other keepsakes designed around your photographs, your stories and your people.
              </p>
              <p>
                Not just something to unwrap, but something to look back at, hold onto and revisit long after the occasion has passed.
              </p>
            </div>
          </section>

          {/* Section 4: Made around your memories */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-10 md:p-12 border border-[#E0D9CF] shadow-xs">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#221F1C] mb-6">
              Made around your memories
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-[#6B6259] leading-relaxed font-sans">
              <p>
                Every person has a different story.
              </p>
              <p>
                A best friend who has been there through everything. A relationship filled with little moments. A family you wish you could keep close every day. Or a memory you want to make a little more special.
              </p>
              <p className="font-medium text-[#221F1C]">
                Your gift should feel like yours.
              </p>
              <p>
                That's the idea behind PrintBloom: taking the moments that matter to you and turning them into something you can keep.
              </p>
              <p>
                Because sometimes, a photograph is more than a photograph. It's a whole day, a person, a feeling, a version of life you never want to forget.
              </p>
            </div>
          </section>

          {/* Section 5: Closing CTA */}
          <section className="text-center py-12 px-6 sm:px-12 bg-[#221F1C] text-[#FBF6EE] rounded-3xl shadow-md border border-[#E0D9CF]/20">
            <h2 className="font-serif text-3xl sm:text-4xl mb-4">
              We&apos;re glad you&apos;re here.
            </h2>
            <p className="text-base sm:text-lg text-[#FBF6EE]/80 max-w-xl mx-auto leading-relaxed mb-6 font-sans">
              Whether you&apos;re celebrating someone, surprising a person you love, or simply keeping a little piece of your own story, we&apos;re happy to help you make it personal.
            </p>
            <p className="text-sm text-[#DFBC94] font-mono tracking-wide mb-8">
              Thank you for letting PrintBloom be a small part of your memories.
            </p>
            <p className="font-serif text-xl sm:text-2xl text-white italic mb-8">
              Let&apos;s make something worth keeping.
            </p>

            <NextLink
              href="/products"
              className="inline-flex items-center gap-2 bg-[#DFBC94] text-[#221F1C] font-medium px-8 py-4 rounded-full text-base hover:bg-[#c9a67f] transition-all hover:scale-105 shadow-md"
            >
              <span>Explore Our Gifts</span>
              <ArrowRight className="w-4 h-4" />
            </NextLink>
          </section>

        </div>
      </div>
    </main>
  )
}
