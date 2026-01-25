'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'

export const VideoHero: React.FC<Page['hero']> = ({ links, richText, videoUrl, videoPoster }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    // Light theme für den Header, da der Hintergrund hell ist
    setHeaderTheme('light')
  }, [setHeaderTheme])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = 0.8

      // Fallback für Loop - manche Browser haben Probleme mit dem loop Attribut
      const handleEnded = () => {
        video.currentTime = 0
        video.play()
      }

      video.addEventListener('ended', handleEnded)
      return () => video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Fallback-Video URL (kann in Payload CMS konfiguriert werden)
  const defaultVideoUrl = '/imagevideo.webm'

  return (
    <section className="video-hero-block py-8 md:py-12 lg:py-16 bg-background">
      <div className="container">
        {/* Header Section - Titel links, Beschreibung rechts */}
        <div className="hero-header mb-8 md:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
            {/* Große Überschrift links */}
            <div className="lg:col-span-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                MSC Lennetal
                <br />
                Bamenohl / Attendorn
                <br />
                <span className="text-secondary">e.V.</span>
              </h1>
            </div>

            {/* Beschreibung und Button rechts */}
            <div className="lg:col-span-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="max-w-md">
                {richText ? (
                  <RichText
                    className="[&_h1]:hidden [&_h2]:hidden [&_h3]:hidden [&_p]:text-base [&_p]:md:text-lg [&_p]:text-muted-foreground [&_p]:leading-relaxed"
                    data={richText}
                    enableGutter={false}
                  />
                ) : (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Wir sind eine Motorsportgruppe aus Attendorn, welche im Automobilsport
                    (Clubsport/VLN/GLP) und im Kartslalom vertreten ist.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Container - Abgerundet, nicht fullwidth */}
        <div className="hero-video-container relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
          {/* Video */}
          <div className="aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] xl:aspect-[2.4/1] relative">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster={videoPoster || undefined}
              onLoadedData={() => setIsVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            >
              <source src="/api/media/file/Imagevideo.webm" type="video/webm" />
              Dein Browser unterstützt keine Videos.
            </video>

            {/* Leichtes Overlay für bessere Lesbarkeit */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>

          {/* CTA Box - Overlay auf dem Video */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-8 md:left-8 lg:bottom-10 lg:left-10">
            <div className="bg-foreground/85 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 md:max-w-md">
              <p className="text-white font-semibold text-base md:text-lg lg:text-xl mb-1">
                Interesse am Motorsport?
              </p>
              <p className="text-white/80 text-sm md:text-base mb-4 md:mb-5">
                Als offizieller ADAC Ortsclub sind wir im Kart- und Autoslalom vertreten. Erfahre
                hier mehr!
              </p>

              {Array.isArray(links) && links.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {links.map(({ link }, i) => {
                    const isPrimary = i === 0
                    return (
                      <CMSLink
                        key={i}
                        {...link}
                        className={`inline-flex items-center justify-center rounded-full px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-300 hover:scale-105 ${
                          isPrimary
                            ? 'bg-secondary text-white hover:bg-secondary/90 shadow-lg'
                            : 'bg-white text-foreground hover:bg-white/90 shadow-md'
                        }`}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-300 hover:scale-105 bg-secondary text-white hover:bg-secondary/90 shadow-lg"
                  >
                    Kontakt
                  </Link>
                  <Link
                    href="#ueber-uns"
                    className="inline-flex items-center justify-center rounded-full px-5 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all duration-300 hover:scale-105 bg-white text-foreground hover:bg-white/90 shadow-md"
                  >
                    Über uns
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
