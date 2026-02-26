import React from 'react'

import RichText from '@/components/RichText'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
    }
  | {
      children?: never
      richText?: unknown
    }

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText }) => {
  return (
    <div className="py-20">
      <div className="container">
        <div className="max-w-3xl">
          {children ||
            (richText ? (
              <RichText
                className="[&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:font-bold [&_h1]:mb-6 [&_p]:text-lg [&_p]:text-muted-foreground [&_p]:mb-4"
                data={richText as import('@payloadcms/richtext-lexical').DefaultTypedEditorState}
                enableGutter={false}
              />
            ) : null)}
        </div>
      </div>
    </div>
  )
}
