import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<Config['globals'][T] | null> {
  try {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug,
      depth,
    })

    return global as Config['globals'][T]
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
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async (): Promise<Config['globals'][T] | null> => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
