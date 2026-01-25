import { MetadataRoute } from 'next'

export const revalidate = 3600 // 1 Stunde Cache

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://example.com'

  const dateFallback = new Date().toISOString()

  // Statische Routen für die Vorstandsarbeit-Anwendung
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/kontobewegungen`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kontobewegungen/uebersicht`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/kontobewegungen/jahresvergleich`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/flugzeuge`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/flugzeuge/kostenermittlung`,
      lastModified: new Date(dateFallback),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  return routes
}
