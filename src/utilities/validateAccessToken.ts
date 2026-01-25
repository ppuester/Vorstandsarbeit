import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export interface TokenValidationResult {
  valid: boolean
  permissions?: string[]
  tokenId?: string
}

/**
 * Validiert einen Access Token und gibt die Berechtigungen zurück
 */
export async function validateAccessToken(
  token: string
): Promise<TokenValidationResult> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'access-tokens' as CollectionSlug,
      where: {
        and: [
          { token: { equals: token } },
          { active: { equals: true } },
        ],
      },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return { valid: false }
    }

    const accessToken = result.docs[0]

    // Prüfe Ablaufdatum
    if (accessToken.expiresAt) {
      const expiresAt = new Date(accessToken.expiresAt as string)
      if (expiresAt < new Date()) {
        return { valid: false }
      }
    }

    // Aktualisiere letzte Verwendung
    await payload.update({
      collection: 'access-tokens' as CollectionSlug,
      id: accessToken.id,
      data: {
        lastUsedAt: new Date().toISOString(),
        usageCount: ((accessToken.usageCount as number) || 0) + 1,
      } as any,
    })

    return {
      valid: true,
      permissions: accessToken.permissions as string[],
      tokenId: accessToken.id,
    }
  } catch (error) {
    console.error('Error validating access token:', error)
    return { valid: false }
  }
}

/**
 * Prüft, ob ein Token eine bestimmte Berechtigung hat
 */
export async function hasPermission(
  token: string,
  permission: string
): Promise<boolean> {
  const validation = await validateAccessToken(token)
  if (!validation.valid || !validation.permissions) {
    return false
  }
  return validation.permissions.includes(permission)
}
