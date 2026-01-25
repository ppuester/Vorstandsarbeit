import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header() {
  let headerData = null
  try {
    headerData = await getCachedGlobal('header', 1)()
  } catch (error) {
    // If fetching header data fails, use null (fallback UI will be shown)
    console.warn('Could not fetch header data:', error)
  }

  return <HeaderClient data={headerData} />
}
