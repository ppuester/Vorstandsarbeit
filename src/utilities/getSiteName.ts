/**
 * Gibt den Website-Namen zurück
 * Kann über NEXT_PUBLIC_SITE_NAME Umgebungsvariable konfiguriert werden
 */
export const getSiteName = (): string => {
  return process.env.NEXT_PUBLIC_SITE_NAME || 'FahrschulFinder'
}
