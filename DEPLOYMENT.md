# Deployment auf Vercel - Schritt für Schritt Anleitung

Diese Anleitung führt dich durch den kompletten Prozess, um deine Payload CMS Website auf Vercel zu hosten und mit einer MongoDB-Datenbank zu verbinden.

## Übersicht

Du benötigst:
1. **Vercel Account** (kostenlos)
2. **MongoDB Atlas Account** (kostenlos für Entwicklung)
3. **GitHub Account** (für Git Repository)

---

## Schritt 1: MongoDB Atlas Datenbank einrichten

### 1.1 MongoDB Atlas Account erstellen

1. Gehe zu [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Klicke auf **"Try Free"** oder **"Sign Up"**
3. Erstelle einen Account mit:
   - **Email-Adresse** (deine E-Mail)
   - **Passwort** (sicheres Passwort)
   - **Vorname** und **Nachname**

### 1.2 Cluster erstellen

1. Nach dem Login wirst du gefragt, welche **Cloud-Anbieter** du verwenden möchtest
   - Wähle **AWS** (empfohlen) oder **Google Cloud** oder **Azure**
   - Wähle eine **Region** nahe zu deinem Standort (z.B. `Frankfurt (eu-central-1)`)

2. Wähle den **kostenlosen M0 Cluster** (Free Tier)
   - Name: z.B. `Cluster0` (Standard)
   - Klicke auf **"Create Cluster"**

3. Warte 3-5 Minuten, bis der Cluster erstellt wird

### 1.3 Datenbank-Benutzer erstellen

1. Während der Cluster erstellt wird, wirst du aufgefordert, einen **Datenbank-Benutzer** zu erstellen
2. Fülle die Felder aus:
   - **Username**: z.B. `admin` oder `payload-user`
   - **Password**: Generiere ein sicheres Passwort (klicke auf "Autogenerate Secure Password" oder erstelle selbst)
   - **⚠️ WICHTIG**: Speichere das Passwort sicher! Du brauchst es später.

3. Wähle **"Read and write to any database"** (Standard)
4. Klicke auf **"Create Database User"**

### 1.4 Netzwerk-Zugriff konfigurieren

1. Du wirst gefragt, wo du auf deine Datenbank zugreifen möchtest
2. Für Vercel wähle:
   - **"Add My Current IP Address"** (für lokale Entwicklung)
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - **⚠️ WICHTIG für Vercel**
   
   **Hinweis**: Für Production sollte man spezifische IPs verwenden, aber für den Start ist "Anywhere" einfacher.

3. Klicke auf **"Finish and Close"**

### 1.5 Connection String erhalten

1. Nachdem der Cluster erstellt ist, klicke auf **"Connect"** (grüner Button)
2. Wähle **"Connect your application"**
3. Wähle:
   - **Driver**: `Node.js`
   - **Version**: `5.5 or later` (oder neueste Version)
4. Kopiere den **Connection String** - er sieht so aus:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Ersetze** `<username>` und `<password>` mit deinen Werten:
   - `<username>` → dein Datenbank-Benutzername (z.B. `admin`)
   - `<password>` → dein Datenbank-Passwort (URL-kodiert, wenn es Sonderzeichen enthält)
   
   **Beispiel**:
   ```
   mongodb+srv://admin:MeinPasswort123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Füge den Datenbanknamen hinzu** vor dem `?`:
   ```
   mongodb+srv://admin:MeinPasswort123@cluster0.xxxxx.mongodb.net/meine-datenbank?retryWrites=true&w=majority
   ```
   
   Ersetze `meine-datenbank` mit deinem gewünschten Datenbanknamen (z.B. `payload-cms`)

7. **Speichere diesen Connection String sicher** - du brauchst ihn für Vercel!

---

## Schritt 2: GitHub Repository vorbereiten

### 2.1 Code zu GitHub pushen

1. Falls noch nicht geschehen, erstelle ein neues Repository auf GitHub:
   - Gehe zu [GitHub](https://github.com)
   - Klicke auf **"New repository"**
   - Name: z.B. `meine-payload-website`
   - Wähle **Public** oder **Private**
   - Klicke auf **"Create repository"**

2. In deinem lokalen Projekt:
   ```bash
   # Falls noch nicht initialisiert
   git init
   
   # Alle Dateien hinzufügen (außer .env)
   git add .
   git commit -m "Initial commit"
   
   # GitHub Repository als Remote hinzufügen
   git remote add origin https://github.com/DEIN-USERNAME/meine-payload-website.git
   
   # Code zu GitHub pushen
   git push -u origin main
   ```

### 2.2 .env Datei NICHT committen

Stelle sicher, dass `.env` in `.gitignore` ist (sollte bereits der Fall sein):
```bash
# Prüfe .gitignore
cat .gitignore | grep .env
```

---

## Schritt 3: Vercel Account und Projekt einrichten

### 3.1 Vercel Account erstellen

1. Gehe zu [Vercel](https://vercel.com)
2. Klicke auf **"Sign Up"**
3. Wähle **"Continue with GitHub"** (empfohlen)
4. Autorisiere Vercel, auf deine GitHub-Repositories zuzugreifen

### 3.2 Neues Projekt erstellen

1. Nach dem Login klicke auf **"Add New..."** → **"Project"**
2. Wähle dein GitHub Repository aus (z.B. `meine-payload-website`)
3. Klicke auf **"Import"**

### 3.3 Projekt-Konfiguration

1. **Framework Preset**: Sollte automatisch **"Next.js"** erkannt werden
2. **Root Directory**: `.` (Standard)
3. **Build Command**: `pnpm build` (oder `npm run build`)
4. **Output Directory**: `.next` (Standard)
5. **Install Command**: `pnpm install` (oder `npm install`)

### 3.4 Umgebungsvariablen konfigurieren

**WICHTIG**: Bevor du deployst, musst du alle Umgebungsvariablen setzen!

Klicke auf **"Environment Variables"** und füge folgende Variablen hinzu:

#### Erforderliche Variablen:

1. **PAYLOAD_SECRET**
   - Generiere einen sicheren String:
     ```bash
     openssl rand -base64 32
     ```
   - Kopiere den generierten String
   - Füge ihn als `PAYLOAD_SECRET` hinzu

2. **DATABASE_URL**
   - Verwende den Connection String von MongoDB Atlas (Schritt 1.5)
   - Beispiel: `mongodb+srv://admin:Passwort123@cluster0.xxxxx.mongodb.net/meine-datenbank?retryWrites=true&w=majority`

3. **NEXT_PUBLIC_SERVER_URL**
   - Lassen Sie dieses Feld **leer** für den ersten Deploy
   - Vercel setzt dies automatisch nach dem ersten Deploy
   - Nach dem ersten Deploy: Setze es auf `https://deine-domain.vercel.app`

4. **NEXT_PUBLIC_SITE_NAME**
   - Name deiner Website, z.B. `Meine Website`

5. **PREVIEW_SECRET**
   - Generiere einen sicheren String:
     ```bash
     openssl rand -base64 32
     ```
   - Kopiere den generierten String
   - Füge ihn als `PREVIEW_SECRET` hinzu

#### Optionale Variablen:

6. **CRON_SECRET** (nur wenn du geplante Jobs verwendest)
   - Generiere einen sicheren String:
     ```bash
     openssl rand -base64 32
     ```

7. **BLOB_READ_WRITE_TOKEN** (nur wenn du Vercel Blob Storage verwendest)
   - Wird automatisch gesetzt, wenn du Blob Storage in Vercel aktivierst

### 3.5 Deploy starten

1. Klicke auf **"Deploy"**
2. Warte 2-5 Minuten, bis der Build abgeschlossen ist
3. Nach erfolgreichem Deploy erhältst du eine URL wie: `https://meine-payload-website.vercel.app`

---

## Schritt 4: Nach dem ersten Deploy

### 4.1 NEXT_PUBLIC_SERVER_URL aktualisieren

1. Gehe zu deinem Vercel Projekt
2. Klicke auf **"Settings"** → **"Environment Variables"**
3. Finde `NEXT_PUBLIC_SERVER_URL`
4. Setze den Wert auf deine Vercel-URL: `https://meine-payload-website.vercel.app`
5. Klicke auf **"Save"**
6. Gehe zu **"Deployments"** und klicke auf die drei Punkte → **"Redeploy"**

### 4.2 Ersten Admin-User erstellen

1. Öffne deine Website: `https://meine-payload-website.vercel.app/admin`
2. Du wirst aufgefordert, den ersten Admin-User zu erstellen
3. Fülle die Felder aus:
   - **Email**: deine E-Mail-Adresse
   - **Password**: sicheres Passwort
   - **Name**: dein Name
4. Klicke auf **"Create First User"**

### 4.3 Website testen

1. Gehe zur Startseite: `https://meine-payload-website.vercel.app`
2. Gehe zum Admin Panel: `https://meine-payload-website.vercel.app/admin`
3. Teste das Erstellen von Seiten und Posts

---

## Schritt 5: Vercel Blob Storage (Optional - für Media-Uploads)

Wenn du große Dateien hochladen möchtest, aktiviere Vercel Blob Storage:

1. In Vercel Dashboard: Gehe zu **"Storage"**
2. Klicke auf **"Create Database"**
3. Wähle **"Blob"**
4. Name: z.B. `media-storage`
5. Klicke auf **"Create"**
6. Das `BLOB_READ_WRITE_TOKEN` wird automatisch als Umgebungsvariable gesetzt
7. Redeploy dein Projekt

---

## Schritt 6: Custom Domain (Optional)

### 6.1 Domain hinzufügen

1. In Vercel Dashboard: Gehe zu **"Settings"** → **"Domains"**
2. Füge deine Domain hinzu (z.B. `meine-website.de`)
3. Folge den DNS-Anweisungen von Vercel

### 6.2 NEXT_PUBLIC_SERVER_URL aktualisieren

1. Nachdem die Domain aktiv ist, aktualisiere `NEXT_PUBLIC_SERVER_URL` auf deine Custom Domain
2. Redeploy das Projekt

---

## Troubleshooting

### Problem: Build schlägt fehl

**Lösung**:
- Prüfe die Build-Logs in Vercel
- Stelle sicher, dass alle Umgebungsvariablen gesetzt sind
- Prüfe, ob `package.json` korrekt ist

### Problem: Datenbank-Verbindung schlägt fehl

**Lösung**:
- Prüfe, ob MongoDB Atlas Netzwerk-Zugriff auf "Anywhere" (0.0.0.0/0) gesetzt ist
- Prüfe, ob der Connection String korrekt ist (Username/Password URL-kodiert)
- Prüfe, ob der Datenbankname im Connection String enthalten ist

### Problem: Admin Panel zeigt Fehler

**Lösung**:
- Stelle sicher, dass `PAYLOAD_SECRET` gesetzt ist
- Prüfe die Vercel Function Logs
- Redeploy das Projekt

### Problem: Bilder werden nicht angezeigt

**Lösung**:
- Aktiviere Vercel Blob Storage (Schritt 5)
- Oder stelle sicher, dass das `public/media` Verzeichnis korrekt deployed wird

---

## Wichtige Sicherheitshinweise

1. **Niemals Secrets in Git committen**
   - `.env` sollte immer in `.gitignore` sein
   - Verwende nur Vercel Environment Variables

2. **MongoDB Passwort sicher aufbewahren**
   - Verwende einen Passwort-Manager
   - Rotiere Passwörter regelmäßig

3. **PAYLOAD_SECRET regelmäßig rotieren**
   - Generiere neue Secrets für Production
   - Alte Secrets ungültig machen

4. **MongoDB Netzwerk-Zugriff einschränken**
   - Für Production: Verwende spezifische IPs statt "Anywhere"
   - Vercel IPs können über Vercel Dashboard gefunden werden

---

## Nächste Schritte

Nach erfolgreichem Deployment:

1. **Content erstellen**: Erstelle deine ersten Seiten und Posts im Admin Panel
2. **SEO optimieren**: Konfiguriere Meta-Tags für alle Seiten
3. **Custom Domain**: Füge deine eigene Domain hinzu
4. **Monitoring**: Aktiviere Vercel Analytics für Performance-Monitoring
5. **Backups**: Richte regelmäßige MongoDB Backups ein

---

## Support

Bei Problemen:
- Prüfe die [Vercel Dokumentation](https://vercel.com/docs)
- Prüfe die [Payload CMS Dokumentation](https://payloadcms.com/docs)
- Prüfe die [MongoDB Atlas Dokumentation](https://docs.atlas.mongodb.com/)
