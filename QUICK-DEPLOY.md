# Schnell-Deployment Checkliste

Eine kurze Checkliste für das Deployment auf Vercel.

## Vorbereitung

- [ ] MongoDB Atlas Account erstellt
- [ ] MongoDB Cluster erstellt (M0 Free Tier)
- [ ] Datenbank-Benutzer erstellt (Username + Passwort notieren!)
- [ ] Netzwerk-Zugriff auf "Anywhere" (0.0.0.0/0) gesetzt
- [ ] Connection String kopiert und Datenbankname hinzugefügt
- [ ] Code zu GitHub gepusht
- [ ] Vercel Account erstellt

## Vercel Setup

- [ ] Neues Projekt in Vercel erstellt
- [ ] GitHub Repository verbunden

## Umgebungsvariablen in Vercel setzen

- [ ] `PAYLOAD_SECRET` - Generiert mit `openssl rand -base64 32`
- [ ] `DATABASE_URL` - MongoDB Atlas Connection String
- [ ] `NEXT_PUBLIC_SITE_NAME` - Name deiner Website
- [ ] `PREVIEW_SECRET` - Generiert mit `openssl rand -base64 32`
- [ ] `CRON_SECRET` (optional) - Generiert mit `openssl rand -base64 32`

## Deploy

- [ ] Deploy gestartet
- [ ] Build erfolgreich abgeschlossen
- [ ] `NEXT_PUBLIC_SERVER_URL` auf Vercel-URL gesetzt (nach erstem Deploy)
- [ ] Projekt neu deployed

## Nach Deploy

- [ ] Admin-User erstellt unter `/admin`
- [ ] Website getestet
- [ ] Erste Seite/Post erstellt

## Optional

- [ ] Vercel Blob Storage aktiviert (für Media-Uploads)
- [ ] Custom Domain hinzugefügt
- [ ] `NEXT_PUBLIC_SERVER_URL` auf Custom Domain aktualisiert
