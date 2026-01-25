import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import type { BlogCardPost } from '@/components/BlogCard'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  let formattedPosts: BlogCardPost[] = []

  try {
    const payload = await getPayload({ config: configPromise })

    const posts = await payload.find({
      collection: 'search',
      depth: 1,
      limit: 12,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
      },
      pagination: false,
      ...(query
        ? {
            where: {
              or: [
                {
                  title: {
                    like: query,
                  },
                },
                {
                  'meta.description': {
                    like: query,
                  },
                },
                {
                  'meta.title': {
                    like: query,
                  },
                },
                {
                  slug: {
                    like: query,
                  },
                },
              ],
            },
          }
        : {}),
    })

    // Transformiere die Suchergebnisse in BlogCardPost Format
    formattedPosts = posts.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      categories: doc.categories,
      meta: doc.meta,
      publishedAt: doc.publishedAt,
    }))
  } catch (error) {
    // During build time, if database is not available, use empty data
    // Page will be generated on-demand at runtime
    console.warn('Could not fetch search results:', error)
  }

  return (
    <div className="bg-background">
      <PageClient />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-secondary/30 to-background py-20 border-b">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Suche</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Durchsuchen Sie unsere Beiträge und finden Sie genau das, was Sie suchen
            </p>
            <div className="max-w-2xl mx-auto">
              <Search />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-16">
        {formattedPosts.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-8">
              {formattedPosts.length} {formattedPosts.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden
            </p>
            <CollectionArchive posts={formattedPosts} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Keine Ergebnisse gefunden</h2>
              <p className="text-muted-foreground">
                Versuchen Sie es mit anderen Suchbegriffen oder durchstöbern Sie unsere Beiträge.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Suche | MSC Lennetal',
    description: 'Durchsuchen Sie unsere Beiträge und Inhalte',
  }
}
