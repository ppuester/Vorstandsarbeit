import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = pages.docs
      ?.filter((doc) => {
        return doc.slug !== 'home'
      })
      .map(({ slug }) => {
        return { slug }
      })

    return params || []
  } catch (error) {
    // During build time, if database is not available, return empty array
    // Pages will be generated on-demand at runtime
    console.warn('Could not fetch pages for static generation:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  let draft = false
  try {
    const draftModeResult = await draftMode()
    draft = draftModeResult.isEnabled
  } catch (_ignore) {
    // Ignore draft mode errors
  }
  
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  try {
    page = await queryPageBySlug({
      slug: decodedSlug,
    })
  } catch (error) {
    // If database is not available, use fallback
    console.warn('Could not fetch page:', error)
    page = null
  }

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="bg-background">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  
  let page = null
  try {
    page = await queryPageBySlug({
      slug: decodedSlug,
    })
  } catch (_error) {
    // If database is not available, return default metadata
    console.warn('Could not fetch page metadata:', _error)
  }

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
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
      collection: 'pages',
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  } catch (error) {
    // If database is not available, return null
    console.warn(`Could not fetch page with slug "${slug}":`, error)
    return null
  }
})
