# Vercel Environment Variables Checkliste

## ✅ Bereits gesetzt (laut Screenshot):
- [x] `PAYLOAD_SECRET` = a7kQpV9mX3tR6zN1cY8Lh0JwS5fG2dB4uK7eT9nC1pR6xZ0vH3mQ8sW2yL5jF1dP
- [x] `MONGODB_URI` = (bereits gesetzt)

## ❌ Noch zu setzen:

### 1. DATABASE_URL (WICHTIG!)
**Name:** `DATABASE_URL`  
**Value:** Gleicher Wert wie `MONGODB_URI` (oder angepasst mit Datenbankname)  
**Environment:** Production, Preview, Development

**Hinweis:** Payload CMS sucht nach `DATABASE_URL`, `MONGODB_URI` oder `MONGODB_URL`. Da du `MONGODB_URI` bereits hast, sollte es funktionieren. Aber für Konsistenz kannst du auch `DATABASE_URL` mit dem gleichen Wert setzen.

### 2. NEXT_PUBLIC_SITE_NAME
**Name:** `NEXT_PUBLIC_SITE_NAME`  
**Value:** z.B. `Pascal Website` oder `Deine Website`  
**Environment:** Production, Preview, Development

### 3. PREVIEW_SECRET
**Name:** `PREVIEW_SECRET`  
**Value:** Generiere einen neuen Secret (siehe unten)  
**Environment:** Production, Preview, Development

### 4. NEXT_PUBLIC_SERVER_URL (nach erstem Deploy!)
**Name:** `NEXT_PUBLIC_SERVER_URL`  
**Value:** Wird nach dem ersten Deploy auf deine Vercel-URL gesetzt (z.B. `https://pascal.vercel.app`)  
**Environment:** Production, Preview, Development

**⚠️ WICHTIG:** Diese Variable setzt du erst NACH dem ersten erfolgreichen Deploy!

### Optional:
- `CRON_SECRET` (nur wenn du geplante Jobs verwendest)
