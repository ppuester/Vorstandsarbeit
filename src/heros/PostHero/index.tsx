import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

type PostHeroPost = {
  categories?: Array<{ title?: string } | string>
  heroImage?: unknown
  populatedAuthors?: unknown
  publishedAt?: string
  title?: string
}

export const PostHero: React.FC<{
  post: PostHeroPost
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    Array.isArray(populatedAuthors) &&
    populatedAuthors.length > 0 &&
    formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative">
      {/* Kariertes Hintergrund-Muster - mit eigenem overflow-hidden */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, hsl(var(--secondary)) 25%, transparent 25%),
              linear-gradient(-45deg, hsl(var(--secondary)) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, hsl(var(--secondary)) 75%),
              linear-gradient(-45deg, transparent 75%, hsl(var(--secondary)) 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          }}
        />
        {/* Fade nach unten */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        {/* Hero Image als Overlay */}
        {(heroImage && typeof heroImage !== 'string' ? (
          <div className="absolute inset-0 -z-10 opacity-10">
            <Media
              fill
              priority
              imgClassName="object-cover"
              resource={heroImage as import('@/payload-types').Media}
            />
          </div>
        ) : null) as React.ReactNode}
      </div>

      {((): React.ReactNode => (
        <>
        <div className="container relative py-20">
          <div className="max-w-4xl">
          {/* Categories */}
          <div className="uppercase text-sm font-medium text-primary mb-4">
            <>
              {(Array.isArray(categories) ? categories : []).map((category, index, arr): React.ReactNode => {
              if (typeof category === 'object' && category !== null) {
                const cat = category as { title?: string }
                const titleToUse = cat.title || 'Untitled category'
                const isLast = index === arr.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast ? <React.Fragment>, &nbsp;</React.Fragment> : null}
                  </React.Fragment>
                )
              }
              return null
              })}
            </>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
            {title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-8 text-muted-foreground">
            {hasAuthors ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Autor</p>
                <p>{formatAuthors(populatedAuthors as Array<{ name?: string }>)}</p>
              </div>
            ) : null}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">Veröffentlicht</p>
                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image Below (if exists) - außerhalb des overflow-hidden */}
      {heroImage && typeof heroImage !== 'string' ? (
        <div className="container relative pb-16">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
            <Media
              fill
              imgClassName="object-cover"
              resource={heroImage as import('@/payload-types').Media}
            />
          </div>
        </div>
      ) : null}
        </>
      ))()}
    </div>
  )
}

