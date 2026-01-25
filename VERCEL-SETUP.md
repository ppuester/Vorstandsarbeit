# Vercel Deployment Setup

## Umgebungsvariablen in Vercel konfigurieren

In Ihrem Vercel-Projekt müssen folgende Umgebungsvariablen gesetzt werden:

### Erforderliche Variablen

1. **PAYLOAD_SECRET**
   - Generieren Sie einen sicheren Secret-String
   - Beispiel: `openssl rand -base64 32`
   - Wichtig: Verwenden Sie einen starken, zufälligen Wert

2. **MONGODB_URI**
   - Ihre MongoDB Atlas Verbindungsstring
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
   - Beispiel: `mongodb+srv://Vercel-Admin-vorstandsarbeit:tCFB2pOGyToaoBQd@vorstandsarbeit.npy87vu.mongodb.net/?retryWrites=true&w=majority`

### Optionale Variablen

3. **NEXT_PUBLIC_SERVER_URL**
   - Ihre Vercel-URL (wird automatisch von Vercel gesetzt)
   - Beispiel: `https://vorstandsarbeit.vercel.app`

4. **CRON_SECRET** (optional)
   - Secret für geplante Jobs
   - Nur erforderlich, wenn Sie CRON-Jobs verwenden

## Vercel-Konfiguration

Die Datenbankverbindung ist bereits für Vercel optimiert:

- ✅ Verwendet `attachDatabasePool` aus `@vercel/functions`
- ✅ Unterstützt automatisches Connection Pooling
- ✅ Verhindert Connection Leaks in serverless Functions

Die Konfiguration in `src/payload.config.ts` ist bereits korrekt eingerichtet.

## Umgebungsvariablen in Vercel setzen

1. Gehen Sie zu Ihrem Vercel-Projekt
2. Navigieren Sie zu **Settings** → **Environment Variables**
3. Fügen Sie die oben genannten Variablen hinzu
4. Stellen Sie sicher, dass sie für alle Umgebungen (Production, Preview, Development) gesetzt sind

## MongoDB Atlas Konfiguration

Stellen Sie sicher, dass:

1. **Network Access**: Ihre Vercel-IP-Adressen oder `0.0.0.0/0` (alle IPs) erlaubt sind
2. **Database User**: Ein Benutzer mit den erforderlichen Berechtigungen existiert
3. **Connection String**: Der korrekte Connection String verwendet wird

## Lokale Entwicklung

Für lokale Entwicklung erstellen Sie eine `.env` Datei:

```env
PAYLOAD_SECRET=your-local-secret-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

**Wichtig**: Die `.env` Datei sollte nicht in Git committed werden (ist bereits in `.gitignore`).
