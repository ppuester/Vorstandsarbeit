import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="info">
        <h4>Willkommen im Vorstandsarbeit Admin-Panel!</h4>
      </Banner>
      <p>
        Dies ist Ihr Verwaltungsbereich für die Kassierer-Aufgaben. Hier können Sie alle
        finanziellen Transaktionen, Mitglieder und Berichte verwalten.
      </p>
      <p className="mt-4">
        <strong>Nächste Schritte:</strong>
      </p>
      <ul className={`${baseClass}__instructions`}>
        <li>Erstellen Sie Ihre ersten Collections für Finanzen, Mitglieder und Rechnungen</li>
        <li>Konfigurieren Sie die Zugriffsrechte für verschiedene Benutzerrollen</li>
        <li>Beginnen Sie mit der Erfassung von Einnahmen und Ausgaben</li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
