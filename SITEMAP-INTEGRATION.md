# Sitemap & SEO - Automatische Integration

## ✅ Was wurde implementiert

### 1. Einzelne Sitemap unter `/sitemap.xml`
Eine zentrale Sitemap die automatisch alle veröffentlichten Payload Collections enthält.

**Verfügbar unter:** `/sitemap.xml`

### 2. Automatische Aktualisierung
Die Sitemap wird automatisch bei jeder Änderung in Payload (Create, Update, Delete) aktualisiert.

**Implementiert in:** `src/payload.config.ts`
```typescript
// Globale Hooks für alle Collections
hooks: {
  afterChange: [revalidateSitemapHook],
  afterDelete: [revalidateSitemapHook],
}
```

### 3. Caching & Performance
- Sitemap wird für 1 Stunde gecacht (`revalidate: 3600`)
- Bei Änderungen wird der Cache sofort invalidiert via `revalidateTag()`
- Optimale Performance ohne manuelle Eingriffe

### 4. Robots.txt
SEO-optimierte robots.txt mit Verweis auf die Sitemap.

**Verfügbar unter:** `/robots.txt`

## 🚀 Wie es funktioniert

Die Sitemap liest automatisch alle Collections aus und generiert URLs:

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  
  // Pages → / oder /{slug}
  // Posts → /posts/{slug}
  // Automatisch bei jeder Änderung aktualisiert
}
```

### Neue Collection hinzufügen

1. **Collection erstellen** (z.B. `Events.ts` in `src/collections/`)

2. **Sitemap erweitern** in `src/app/sitemap.ts`:
```typescript
try {
  // Events Collection
  const events = await payload.find({
    collection: 'events',
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      _status: { equals: 'published' },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  events.docs.forEach((event: any) => {
    if (event?.slug) {
      routes.push({
        url: `${SITE_URL}/termine/${event.slug}`,
        lastModified: new Date(event.updatedAt || dateFallback),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  })
} catch (error) {
  console.error('Error fetching events:', error)
}
```

3. **Fertig!** Die Revalidierung funktioniert automatisch.

## 📋 Vorteile

✅ **Eine einzige Sitemap** - Einfach zu verwalten unter `/sitemap.xml`  
✅ **Automatisch** - Keine manuellen Updates nötig  
✅ **Performance** - 1h Cache + On-Demand Revalidation  
✅ **SEO-optimiert** - Korrekte lastModified Timestamps  
✅ **Skalierbar** - Funktioniert mit beliebig vielen Collections  
✅ **Clean** - Nur Landing Page + Payload-Routen

## 🔍 Testen

1. Sitemap aufrufen: `http://localhost:3000/sitemap.xml`
2. Content in Payload ändern
3. Sitemap neu laden → Änderungen sind nach max. 1h sichtbar (oder sofort bei Revalidation)

## 📦 Struktur

```
src/
├── app/
│   ├── sitemap.ts              # ⭐ ZENTRALE SITEMAP
│   └── robots.ts               # SEO Robots.txt
└── payload.config.ts           # Automatische Revalidierung
```

## 🎯 Für MSC Lennetal

Perfekt vorbereitet für Kartverein-Collections:
- `events` → `/termine/{slug}`
- `news` → `/aktuelles/{slug}`
- `race-reports` → `/rennsport/{slug}`
- `gallery-albums` → `/galerie/{slug}`
- `team-members` → `/vorstand/{slug}`

Alle in **einer** Sitemap unter `/sitemap.xml`! 🏎️

## 🔧 Collection-to-URL Mapping

In `sitemap.ts` festlegen welche Collection zu welcher URL wird:

```typescript
const collectionRoutes = {
  pages: (slug) => slug === 'home' ? '/' : `/${slug}`,
  posts: (slug) => `/posts/${slug}`,
  events: (slug) => `/termine/${slug}`,
  news: (slug) => `/aktuelles/${slug}`,
  // ... weitere Collections
}
```
