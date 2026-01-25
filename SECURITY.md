# Sicherheitsrichtlinien

Dieses Dokument beschreibt die Sicherheitsmaßnahmen und Best Practices für dieses Payload CMS Template.

## Umgebungsvariablen

### Erforderliche Secrets

Die folgenden Umgebungsvariablen **müssen** gesetzt werden und sollten starke, zufällige Werte haben:

- **PAYLOAD_SECRET**: Wird zur Verschlüsselung von JWTs verwendet
  - Generierung: `openssl rand -base64 32`
  - **WICHTIG**: Niemals in Git committen!

- **PREVIEW_SECRET**: Wird für Draft Preview Funktionalität verwendet
  - Generierung: `openssl rand -base64 32`
  - **WICHTIG**: Niemals in Git committen!

- **CRON_SECRET**: Wird für geplante Jobs verwendet (optional, aber empfohlen)
  - Generierung: `openssl rand -base64 32`
  - **WICHTIG**: Niemals in Git committen!

### Validierung

Das System validiert beim Start, ob `PAYLOAD_SECRET` und `DATABASE_URL` gesetzt sind. Wenn nicht, wird die Anwendung nicht gestartet.

## Access Control

### Collection-Level Access

Alle Collections haben angemessene Access Control:

- **Users**: Nur authentifizierte Benutzer können auf das Admin Panel zugreifen
- **Posts/Pages**: Öffentlich lesbar wenn veröffentlicht, nur authentifizierte Benutzer können erstellen/bearbeiten
- **Media**: Geschützt durch Payload's Standard-Access Control

### Local API Access Control

**KRITISCH**: Wenn die Local API mit einem `user` Parameter verwendet wird, muss `overrideAccess: false` gesetzt werden, um die Access Control zu erzwingen:

```typescript
// ✅ KORREKT
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // Erzwingt Access Control
})

// ❌ SICHERHEITSPROBLEM
await payload.find({
  collection: 'posts',
  user: someUser, // Access Control wird umgangen!
})
```

## Transaction Safety

### Hooks

In Hooks muss `req` immer an verschachtelte Operationen weitergegeben werden, um Transaktionssicherheit zu gewährleisten:

```typescript
// ✅ KORREKT
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Wichtig für Transaktionssicherheit
      })
    },
  ],
}
```

## Input Validation

### Form Submissions

Formular-Einreichungen werden durch Payload's Form Builder Plugin validiert. Zusätzliche Validierung kann in den Collection Hooks hinzugefügt werden.

### URL Parameters

URL-Parameter werden validiert:
- Preview-Route validiert `previewSecret` gegen `PREVIEW_SECRET`
- Sitemap-Routen verwenden `overrideAccess: false` für sichere Abfragen

## Authentifizierung

### JWT Tokens

- Tokens werden sicher in HTTP-only Cookies gespeichert
- Token-Validierung erfolgt serverseitig
- Abgelaufene Tokens werden automatisch ungültig

### Preview Authentication

Draft Preview erfordert:
1. Gültiges `previewSecret` Parameter
2. Authentifizierter Benutzer (JWT Token)

## Datenbank

### MongoDB

- Verbindungsstrings sollten niemals in Git committet werden
- Verwende starke Passwörter für Datenbank-Benutzer
- Aktiviere MongoDB's Authentication
- Verwende TLS/SSL für Verbindungen (empfohlen)

### Connection Pooling

Das System verwendet Vercel's `attachDatabasePool` für optimale Connection-Verwaltung in Serverless-Umgebungen.

## Best Practices

### 1. Secrets Management

- Verwende `.env` Dateien für lokale Entwicklung
- Verwende Umgebungsvariablen in Production (Vercel, etc.)
- Niemals Secrets in Git committen
- Rotiere Secrets regelmäßig

### 2. Code Review

- Überprüfe alle Local API Aufrufe auf `overrideAccess: false`
- Überprüfe alle Hooks auf korrekte `req` Weitergabe
- Überprüfe Access Control Konfigurationen

### 3. Monitoring

- Überwache fehlgeschlagene Authentifizierungsversuche
- Logge Sicherheitsrelevante Events
- Überwache Datenbank-Zugriffe

### 4. Updates

- Halte Payload CMS und alle Dependencies aktuell
- Überprüfe Security Advisories regelmäßig
- Teste Updates in einer Staging-Umgebung

## Bekannte Sicherheitsprobleme

Keine bekannt. Wenn du ein Sicherheitsproblem findest, bitte melde es verantwortungsvoll.

## Weitere Ressourcen

- [Payload CMS Security Docs](https://payloadcms.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
