import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  let redirects: any[] = []
  try {
    redirects = await getCachedRedirects()()
  } catch (error) {
    // If database is not available, use empty redirects
    console.warn('Could not fetch redirects:', error)
  }

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      try {
        const document = (await getCachedDocument(collection, id)()) as Page | Post
        redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
          document?.slug
        }`
      } catch (error) {
        // If document fetch fails, skip redirect
        console.warn('Could not fetch redirect document:', error)
        if (disableNotFound) return null
        notFound()
      }
    } else {
      redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
        typeof redirectItem.to?.reference?.value === 'object'
          ? redirectItem.to?.reference?.value?.slug
          : ''
      }`
    }

    if (redirectUrl) redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
