'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  })

  return (
    <div className="relative overflow-hidden bg-background">
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh] py-20">
          {/* Content */}
          <div className="max-w-2xl">
            {richText && (
              <RichText 
                className="mb-8 [&_h1]:text-5xl [&_h1]:md:text-6xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-6 [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:leading-relaxed" 
                data={richText} 
                enableGutter={false} 
              />
            )}
            {Array.isArray(links) && links.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {links.map(({ link }, i) => {
                  return (
                    <CMSLink 
                      key={i} 
                      {...link}
                      className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            {media && typeof media === 'object' && (
              <Media 
                fill 
                imgClassName="object-cover" 
                priority 
                resource={media}
                className="transition-transform duration-700 hover:scale-105" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
