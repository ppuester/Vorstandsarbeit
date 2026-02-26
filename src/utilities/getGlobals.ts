import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

async function getGlobal(slug: string, depth = 0): Promise<Record<string, unknown> | null> {
  try {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug: slug as Parameters<typeof payload.findGlobal>[0]['slug'],
      depth,
    })

    return global as Record<string, unknown> | null
  } catch (error) {
    // During build time, if database is not available, return null
    // Components will handle null gracefully
    console.warn(`Could not fetch global "${slug}":`, error)
    return null
  }
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = (slug: string, depth = 0) =>
  unstable_cache(async (): Promise<Record<string, unknown> | null> => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
