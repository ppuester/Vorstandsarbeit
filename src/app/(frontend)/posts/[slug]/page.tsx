import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    // During build time, if database is not available, return empty array
    // Posts will be generated on-demand at runtime
    console.warn('Could not fetch posts for static generation:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  let draft = false
  try {
    const draftModeResult = await draftMode()
    draft = draftModeResult.isEnabled
  } catch (_ignore) {
    // Ignore draft mode errors
  }
  
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  
  let post = null
  try {
    post = await queryPostBySlug({ slug: decodedSlug })
  } catch (error) {
    // If database is not available, return redirect
    console.warn('Could not fetch post:', error)
  }

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="bg-background">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="py-16">
        <div className="container">
          <div className="max-w-4xl">
            <RichText data={post.content} enableGutter={false} />
          </div>
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-4xl"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  
  let post = null
  try {
    post = await queryPostBySlug({ slug: decodedSlug })
  } catch (_error) {
    // If database is not available, return default metadata
    console.warn('Could not fetch post metadata:', _error)
  }

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  try {
    let draft = false
    try {
      const draftModeResult = await draftMode()
      draft = draftModeResult.isEnabled
    } catch (_ignore) {
      // Ignore draft mode errors
    }

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  } catch (error) {
    // If database is not available, return null
    console.warn(`Could not fetch post with slug "${slug}":`, error)
    return null
  }
})
