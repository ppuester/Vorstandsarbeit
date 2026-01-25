import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  // Prüfen, ob Token existiert, bevor Request gemacht wird
  if (!token) {
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    throw new Error('No authentication token found')
  }

  const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
  })

  // Response validieren, bevor JSON geparst wird
  if (!meUserReq.ok) {
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    throw new Error('Failed to authenticate user')
  }

  const {
    user,
  }: {
    user: User
  } = await meUserReq.json()

  if (validUserRedirect && meUserReq.ok && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && (!meUserReq.ok || !user)) {
    redirect(nullUserRedirect)
  }

  // Token wird hier existieren, da der Benutzer umgeleitet wird, wenn er nicht existiert
  return {
    token: token!,
    user,
  }
}
