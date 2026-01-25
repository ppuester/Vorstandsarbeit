import type { CollectionAfterReadHook } from 'payload'
import { User } from 'src/payload-types'

// Die `user` Collection hat gesperrte Access Control, damit Benutzer nicht öffentlich zugänglich sind
// Das bedeutet, dass wir die Autoren hier manuell befüllen müssen, um die Privatsphäre der Benutzer zu schützen
// GraphQL gibt keine mutierten Benutzerdaten zurück, die vom zugrunde liegenden Schema abweichen
// Daher verwenden wir ein alternatives `populatedAuthors` Feld, um die Benutzerdaten zu befüllen, versteckt vor der Admin-UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req, req: { payload } }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorDocs: User[] = []

    for (const author of doc.authors) {
      try {
        // req verwenden, um Transaktionssicherheit und Access Control zu gewährleisten
        // overrideAccess: false stellt sicher, dass Benutzerberechtigungen durchgesetzt werden
        const authorDoc = await payload.findByID({
          id: typeof author === 'object' ? author?.id : author,
          collection: 'users',
          depth: 0,
          req,
          overrideAccess: false, // Access Control durchsetzen
        })

        if (authorDoc) {
          authorDocs.push(authorDoc)
        }

        if (authorDocs.length > 0) {
          doc.populatedAuthors = authorDocs.map((authorDoc) => ({
            id: authorDoc.id,
            name: authorDoc.name,
          }))
        }
      } catch {
        // Fehler unterdrücken - Benutzer hat möglicherweise keinen Zugriff auf Autor
      }
    }
  }

  return doc
}
