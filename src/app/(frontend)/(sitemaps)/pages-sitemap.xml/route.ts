import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config })
      const SITE_URL =
        process.env.NEXT_PUBLIC_SERVER_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        'https://example.com'

      const results = await payload.find({
        collection: 'pages',
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

      // Nur Landing Page und Payload-Routen (keine statischen Seiten)
      const sitemap = results.docs
        ? results.docs
            .filter((page) => Boolean(page?.slug))
            .map((page) => {
              return {
                loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
                lastmod: page.updatedAt || dateFallback,
              }
            })
        : []

      return sitemap
    } catch (error) {
      // If database is not available, return empty sitemap
      console.warn('Could not fetch pages for sitemap:', error)
      return []
    }
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
    revalidate: 3600, // 1 Stunde Cache
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
