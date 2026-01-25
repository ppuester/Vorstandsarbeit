import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="py-16">
      <div className="container">
        <div className="max-w-4xl mb-8">
          {richText && (
            <RichText 
              className="mb-6 [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-bold [&_h1]:mb-6 [&_p]:text-lg [&_p]:text-muted-foreground" 
              data={richText} 
              enableGutter={false} 
            />
          )}

          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return <CMSLink key={i} {...link} />
              })}
            </div>
          )}
        </div>
        
        {media && typeof media === 'object' && (
          <div className="max-w-5xl">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Media
                imgClassName="w-full"
                priority
                resource={media}
              />
            </div>
            {media?.caption && (
              <div className="mt-4">
                <RichText 
                  className="text-sm text-muted-foreground" 
                  data={media.caption} 
                  enableGutter={false} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
