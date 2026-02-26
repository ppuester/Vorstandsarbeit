import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type MediumImpactHeroProps = {
  links?: Array<{ link?: unknown }>
  media?: unknown
  richText?: unknown
}

export const MediumImpactHero: React.FC<MediumImpactHeroProps> = ({ links, media, richText }) => {
  return (
    <div className="py-16">
      <div className="container">
        <div className="max-w-4xl mb-8">
          {richText ? (
            <RichText
              className="mb-6 [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-bold [&_h1]:mb-6 [&_p]:text-lg [&_p]:text-muted-foreground"
              data={richText as import('@payloadcms/richtext-lexical').DefaultTypedEditorState}
              enableGutter={false}
            />
          ) : null}

          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map(({ link }, i) =>
                link && typeof link === 'object' ? (
                  <CMSLink key={i} {...(link as Record<string, unknown>)} />
                ) : null,
              )}
            </div>
          )}
        </div>

        {media && typeof media === 'object' ? (
          <div className="max-w-5xl">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <Media
                imgClassName="w-full"
                priority
                resource={media as import('@/payload-types').Media}
              />
            </div>
            {(media as { caption?: unknown })?.caption ? (
              <div className="mt-4">
                <RichText
                  className="text-sm text-muted-foreground"
                  data={(media as { caption: unknown }).caption as import('@payloadcms/richtext-lexical').DefaultTypedEditorState}
                  enableGutter={false}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
