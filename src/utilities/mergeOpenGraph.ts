import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { getSiteName } from './getSiteName'

const siteName = getSiteName()

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Die #1 Plattform für die Fahrschulsuche in Deutschland. Vergleiche Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule.',
  images: [
    {
      url: `${getServerSideURL()}/og-image.jpg`,
    },
  ],
  siteName,
  title: siteName,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
