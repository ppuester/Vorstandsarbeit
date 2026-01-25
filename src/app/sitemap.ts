import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 3600 // 1 Stunde Cache

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://example.com'

  const routes: MetadataRoute.Sitemap = []
  const dateFallback = new Date().toISOString()

  let payload
  try {
    payload = await getPayload({ config })
  } catch (error) {
    console.error('Error initializing Payload for sitemap:', error)
    return routes // Return empty sitemap if Payload can't be initialized
  }

  try {
    // Pages Collection
    const pages = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: { equals: 'published' },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    pages.docs.forEach((page: any) => {
      if (page?.slug) {
        routes.push({
          url: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
          lastModified: new Date(page.updatedAt || dateFallback),
          changeFrequency: 'monthly',
          priority: page.slug === 'home' ? 1.0 : 0.8,
        })
      }
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
  }

  try {
    // Posts Collection
    const posts = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: { equals: 'published' },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    posts.docs.forEach((post: any) => {
      if (post?.slug) {
        routes.push({
          url: `${SITE_URL}/posts/${post.slug}`,
          lastModified: new Date(post.updatedAt || dateFallback),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
  }

  return routes
}
