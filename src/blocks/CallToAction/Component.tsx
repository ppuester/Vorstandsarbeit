import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container my-16">
      <div className="bg-card rounded-xl border-border border p-8 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="flex-1">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 md:flex-shrink-0">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
