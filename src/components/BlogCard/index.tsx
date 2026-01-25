import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import type { Post, Category, Media as MediaType } from '@/payload-types'

// Partielle Post-Daten für die Card-Ansicht
export type BlogCardPost = {
  id: number
  title: string
  slug: string
  categories?: (number | Category)[] | null
  meta?: {
    title?: string | null
    image?: number | MediaType | null
    description?: string | null
  }
  publishedAt?: string | null
}

export const BlogCard: React.FC<{
  post: BlogCardPost | Post
}> = ({ post }) => {
  const { slug, title, meta, categories, publishedAt } = post

  return (
    <Link
      href={`/posts/${slug}`}
      className="group block bg-background border border-border rounded-xl md:rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 md:h-52 bg-muted overflow-hidden">
        {meta?.image && typeof meta.image !== 'string' && typeof meta.image !== 'number' && (
          <Media
            resource={meta.image}
            fill
            imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Categories & Date */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {categories && categories.length > 0 && (
            <>
              {categories.map((category) => {
                if (typeof category === 'object') {
                  return (
                    <span
                      key={category.id}
                      className="inline-block px-3 py-1 text-xs font-medium bg-secondary/10 text-secondary rounded-full"
                    >
                      {category.title}
                    </span>
                  )
                }
                return null
              })}
            </>
          )}
          {publishedAt && (
            <span className="text-xs text-muted-foreground">{formatDateTime(publishedAt)}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {meta?.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{meta.description}</p>
        )}

        {/* Read More */}
        <div className="mt-4 flex items-center text-primary font-semibold text-sm">
          Weiterlesen
          <svg
            className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
