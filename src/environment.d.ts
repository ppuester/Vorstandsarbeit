declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      MONGODB_URI?: string
      MONGODB_URL?: string
      NEXT_PUBLIC_SERVER_URL?: string
      NEXT_PUBLIC_SITE_NAME?: string
      VERCEL_PROJECT_PRODUCTION_URL?: string
      PREVIEW_SECRET?: string
      CRON_SECRET?: string
      BLOB_READ_WRITE_TOKEN?: string
    }
  }
}

// Wenn diese Datei keine Import/Export-Statements hat (d.h. ein Skript ist)
// in ein Modul umwandeln, indem ein leerer Export-Statement hinzugefügt wird.
export {}
