import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // Leere Strings erlauben, z.B. für die Startseite
  if (slug === undefined || slug === null) {
    return null
  }

  // Kodieren, um Slugs mit Sonderzeichen zu unterstützen
  const encodedSlug = encodeURIComponent(slug)

  // Prüfen, ob PREVIEW_SECRET gesetzt ist
  const previewSecret = process.env.PREVIEW_SECRET
  if (!previewSecret) {
    throw new Error(
      'PREVIEW_SECRET environment variable is required for preview functionality. Please set it in your .env file.',
    )
  }

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret,
  })

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
