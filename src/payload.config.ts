import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { attachDatabasePool } from '@vercel/functions'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { AccessTokens } from './collections/AccessTokens'
import { Aircraft } from './collections/Aircraft'
import { CostCenters } from './collections/CostCenters'
import { FlightLogs } from './collections/FlightLogs'
import { FuelEntries } from './collections/FuelEntries'
import { GeneralCosts } from './collections/GeneralCosts'
import { Members } from './collections/Members'
import { MembershipFeeTypes } from './collections/MembershipFeeTypes'
import { MembershipFeeStats } from './collections/MembershipFeeStats'
import { Media } from './collections/Media'
import { Transactions } from './collections/Transactions'
import { TransactionCategories } from './collections/TransactionCategories'
import { Users } from './collections/Users'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { de } from '@payloadcms/translations/languages/de'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Erforderliche Umgebungsvariablen validieren (nur zur Laufzeit, nicht bei Typgenerierung)
const isGeneratingTypes = process.argv.some(arg => arg.includes('generate:types'))
if (!isGeneratingTypes) {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error(
      'PAYLOAD_SECRET environment variable is required. Please set it in your .env file.',
    )
  }

  if (!process.env.DATABASE_URL && !process.env.MONGODB_URI && !process.env.MONGODB_URL) {
    throw new Error(
      'DATABASE_URL, MONGODB_URI, or MONGODB_URL environment variable is required. Please set it in your .env file.',
    )
  }
}

export default buildConfig({
  admin: {
    components: {
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGODB_URL || '',
    afterOpenConnection: async (adapter) => {
      // Optimierung für Vercel Functions: Datenbank-Pool anhängen, um Verbindungslecks zu verhindern
      // Dies stellt sicher, dass Datenbankverbindungen ordnungsgemäß verwaltet werden, wenn Funktionen pausieren und fortgesetzt werden
      try {
        // Zugriff auf den MongoDB-Client über die Mongoose-Verbindung
        // In Mongoose ist der Client über connection.getClient() (Mongoose 6+) oder connection.client verfügbar
        const connection = adapter.connection
        const client = (connection as any).getClient?.() || (connection as any).client
        if (client) {
          attachDatabasePool(client)
        }
      } catch (error) {
        // Stillschweigend fehlschlagen, wenn attachDatabasePool nicht verfügbar ist (z.B. in lokaler Entwicklung)
        // Dies ist sicher, da es nur für Vercels serverlose Umgebung benötigt wird
        if (process.env.NODE_ENV === 'production') {
          console.warn('Fehler beim Anhängen des Datenbank-Pools:', error)
        }
      }
    },
  }),
  collections: [
    Users,
    Media,
    Transactions,
    TransactionCategories,
    CostCenters,
    Aircraft,
    FlightLogs,
    FuelEntries,
    GeneralCosts,
    AccessTokens,
    Members,
    MembershipFeeTypes,
    MembershipFeeStats,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Authentifizierte Benutzer können Jobs ausführen
        if (req.user) return true

        // Prüfe auf CRON_SECRET im Authorization-Header
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // Wenn CRON_SECRET nicht konfiguriert ist, können nur authentifizierte Benutzer Jobs ausführen
        if (!cronSecret) {
          return false
        }

        // Konstante Zeit-Vergleich verwenden, um Timing-Angriffe zu verhindern
        const expectedHeader = `Bearer ${cronSecret}`
        return authHeader === expectedHeader
      },
    },
    tasks: [],
  },
  i18n: {
    supportedLanguages: { de },
    fallbackLanguage: 'de',
  },
})
