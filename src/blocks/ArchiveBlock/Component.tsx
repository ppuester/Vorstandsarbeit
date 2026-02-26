import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

/** Lokale Typen (posts/ArchiveBlock sind ggf. nicht in payload-types) */
type Post = Record<string, unknown>
type ArchiveBlockProps = {
  id?: string
  blockType?: 'archiveBlock'
  introContent?: unknown
  populateBy?: 'collection' | 'selection'
  relationTo?: 'posts'
  categories?: unknown[]
  limit?: number
  selectedDocs?: Array<{ value: Post | string }>
}

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    try {
      const payload = await getPayload({ config: configPromise })

      const flattenedCategories = categories?.map((category) => {
        if (category != null && typeof category === 'object') return (category as { id?: string }).id
        return category
      })

      const fetchedPosts = await payload.find({
        collection: 'posts' as import('payload').CollectionSlug,
        depth: 1,
        limit,
        ...(flattenedCategories && flattenedCategories.length > 0
          ? {
              where: {
                categories: {
                  in: flattenedCategories,
                },
              },
            }
          : {}),
      })

      posts = fetchedPosts.docs as unknown as Post[]
    } catch (error) {
      // If database is not available, use empty posts
      console.warn('Could not fetch posts for ArchiveBlock:', error)
    }
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent ? (
        <div className="container mb-16">
          <div className="max-w-3xl">
            <RichText data={introContent as DefaultTypedEditorState} enableGutter={false} />
          </div>
        </div>
      ) : null}
      <div className="container">
        <CollectionArchive posts={posts} />
      </div>
    </div>
  )
}
