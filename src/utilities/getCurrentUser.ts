import { cookies } from 'next/headers'
import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return null
    }

    const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store',
    })

    if (!meUserReq.ok) {
      return null
    }

    const { user } = await meUserReq.json()
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}
