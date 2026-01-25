import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const authenticated: isAuthenticated = ({ req }) => {
  // Sicherstellen, dass req und req.user vorhanden sind
  if (!req || !req.user) {
    return false
  }
  return Boolean(req.user)
}
