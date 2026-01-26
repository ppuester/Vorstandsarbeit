import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const authenticated: isAuthenticated = ({ req }) => {
  // In der Admin-Konsole sollte req.user immer vorhanden sein, wenn der Benutzer eingeloggt ist
  // Vereinfachte Prüfung gemäß Payload Best Practices
  return Boolean(req?.user)
}
