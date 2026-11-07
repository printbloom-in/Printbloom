"use client"

import * as React from "react"
import { useRef, useState, useEffect } from "react"
import { SectionHeading } from "@/components/ui/section-heading"
import { Volume2, VolumeX } from "lucide-react"

// ONLY 3 VIDEOS AS REQUESTED
const reactions = [
  { id: 1, src: "https://res.cloudinary.com/sz2wyygq/video/upload/v1788551248/printbloom/reactions/1.mp4", label: "Birthday gift from Friend" },
  { id: 2, src: "https://res.cloudinary.com/sz2wyygq/video/upload/v1788551316/printbloom/reactions/2.mp4", label: "Friends meetup surprise" },
  { id: 3, src: "https://res.cloudinary.com/sz2wyygq/video/upload/v1788551342/printbloom/reactions/3.mp4", label: "Her bestie" },
]

function ReactionVideoCard({ reaction }: { reaction: typeof reactions[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const p = video.play()
            if (p !== undefined) {
              p.then(() => setPlaying(true)).catch(() => {})
            }
          } else {
            video.pause()
            setPlaying(false)
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const handleClick = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      const p = videoRef.current.play()
      if (p !== undefined) {
        p.then(() => setPlaying(true)).catch(() => {})
      }
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }

  return (
    <div
      className="relative group cursor-pointer overflow-hidden bg-[#2C2926] border border-white/10 rounded-2xl w-[250px] sm:w-[270px] md:w-auto shrink-0 snap-center aspect-[9/16] md:aspect-[3/4] lg:aspect-[9/16] max-h-[460px] md:max-h-none shadow-md"
      onClick={handleClick}
    >
        <video
          ref={videoRef}
          src={reaction.src}
          poster={reaction.src.replace('.mp4', '.jpg')}
          preload="metadata"
          crossOrigin="anonymous"
          muted={muted}
          playsInline
          loop
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          onEnded={() => setPlaying(false)}
        />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Play/Pause Icon */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:bg-[#DFBC94]/80 group-hover:border-[#DFBC94] transition-colors duration-300">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Mute button (always visible so user can unmute while it auto-plays) */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {/* Label */}
      <div className="absolute bottom-6 left-6 right-6">
        <p className="text-white font-serif text-xl drop-shadow">{reaction.label}</p>
      </div>
    </div>
  )
}

export function CustomerReactionsSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#221F1C] text-[#FBF6EE]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionHeading as="h2" className="text-[#FBF6EE] mb-4">
            Tears, smiles, and speechless moments.
          </SectionHeading>
          <p className="text-[#9A8F85] text-lg">
            There is nothing quite like watching someone realize their entire story has been printed into a magazine.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 px-1 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 max-w-4xl mx-auto">
          {reactions.map((reaction) => (
            <ReactionVideoCard key={reaction.id} reaction={reaction} />
          ))}
        </div>
        <p className="text-center text-xs text-[#9A8F85] mt-3 md:hidden font-mono">
          &larr; Swipe to view reactions &rarr;
        </p>
      </div>
    </section>
  )
}

