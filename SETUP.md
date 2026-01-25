# Setup-Anleitung

Diese Anleitung hilft dir, das Payload CMS Template für dein neues Projekt einzurichten.

## Schnellstart

### 1. Umgebungsvariablen einrichten

```bash
cp .env.example .env
```

Bearbeite die `.env` Datei und setze folgende **wichtige** Werte:

#### Erforderlich:

- **PAYLOAD_SECRET**: Generiere einen sicheren String:
  ```bash
  openssl rand -base64 32
  ```

- **DATABASE_URL**: MongoDB Verbindungsstring
  - Lokal: `mongodb://localhost:27017/my-database`
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

- **NEXT_PUBLIC_SITE_NAME**: Name deiner Website (wird in SEO-Tags verwendet)

- **PREVIEW_SECRET**: Generiere einen sicheren String:
  ```bash
  openssl rand -base64 32
  ```

#### Optional:

- **CRON_SECRET**: Nur benötigt wenn du geplante Jobs verwendest
- **NEXT_PUBLIC_SERVER_URL**: Wird automatisch erkannt, kann aber überschrieben werden
- **BLOB_READ_WRITE_TOKEN**: Nur für Vercel Blob Storage (wird automatisch gesetzt)

### 2. Dependencies installieren

```bash
pnpm install
```

### 3. MongoDB starten

**Option A: Mit Docker**
```bash
docker-compose up -d mongo
```

**Option B: Lokal**
```bash
mongod
```

**Option C: MongoDB Atlas (Cloud)**
- Erstelle einen kostenlosen Account auf [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Erstelle einen Cluster
- Hole den Connection String und setze ihn als `DATABASE_URL`

### 4. Development Server starten

```bash
pnpm dev
```

### 5. Browser öffnen

- Website: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

### 6. Ersten Admin-User erstellen

Folge den Anweisungen im Admin Panel, um deinen ersten Admin-User zu erstellen.

## Nächste Schritte

### Website-Namen anpassen

Der Website-Name wird über die Umgebungsvariable `NEXT_PUBLIC_SITE_NAME` konfiguriert. Du findest ihn in:

- SEO Meta-Tags
- Page Titles
- Open Graph Tags

**Hinweis**: Es gibt noch einige hardcoded Referenzen im Code (z.B. in Footer, Header, etc.), die du manuell anpassen solltest, wenn du das Template für ein neues Projekt verwendest.

### TypeScript Types generieren

Nach Änderungen an Collections oder Globals:

```bash
pnpm generate:types
```

### Import Map generieren

Nach Änderungen an Custom Components:

```bash
pnpm generate:importmap
```

## Deployment

Siehe [README.md](./README.md#deployment) für detaillierte Deployment-Anweisungen.

## Häufige Probleme

### MongoDB Verbindungsfehler

- Stelle sicher, dass MongoDB läuft (lokal oder Atlas)
- Überprüfe den `DATABASE_URL` in der `.env` Datei
- Bei MongoDB Atlas: Stelle sicher, dass deine IP-Adresse in der Whitelist ist

### Port bereits belegt

Wenn Port 3000 bereits belegt ist, kannst du einen anderen Port verwenden:

```bash
PORT=3001 pnpm dev
```

### TypeScript Fehler

Nach Schema-Änderungen:

```bash
pnpm generate:types
```

## Template anpassen

Dieses Template enthält noch einige spezifische Referenzen zum ursprünglichen Projekt (MSC Lennetal). Du solltest folgende Dateien anpassen:

- `src/app/(frontend)/layout.tsx` - Meta-Tags und SEO
- `src/app/(frontend)/page.tsx` - Homepage Content
- `src/Footer/Component.tsx` - Footer Content
- `src/Header/Component.tsx` - Header Content
- `src/components/Logo/Logo.tsx` - Logo
- Alle Seed-Dateien in `src/endpoints/seed/` - Beispiel-Daten

## Support

Bei Fragen oder Problemen:
- Siehe [Payload CMS Dokumentation](https://payloadcms.com/docs)
- Siehe [README.md](./README.md) für weitere Details
