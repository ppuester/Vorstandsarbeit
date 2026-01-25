import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPostsSitemap = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config })
      const SITE_URL =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        'https://example.com'

      const results = await payload.find({
        collection: 'posts',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        where: {
          _status: {
            equals: 'published',
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      const dateFallback = new Date().toISOString()

      const sitemap = results.docs
        ? results.docs
            .filter((post) => Boolean(post?.slug))
            .map((post) => ({
              loc: `${SITE_URL}/posts/${post?.slug}`,
              lastmod: post.updatedAt || dateFallback,
            }))
        : []

      return sitemap
    } catch (error) {
      // If database is not available, return empty sitemap
      console.warn('Could not fetch posts for sitemap:', error)
      return []
    }
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
    revalidate: 3600, // 1 Stunde Cache
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
