import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Willkommen im FahrschulFinder Admin-Panel!</h4>
      </Banner>
      Hier sind die nächsten Schritte:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' um Beispieldaten zu erstellen, dann '}
          <a href="/" target="_blank" rel="noopener noreferrer">
            besuche deine Website
          </a>
          {' um das Ergebnis zu sehen.'}
        </li>
        <li>
          <strong>Fahrschulen verwalten:</strong>
          {' Füge neue Fahrschulen über die Fahrschulen-Sammlung im Menü links hinzu.'}
        </li>
        <li>
          <strong>Bewertungen moderieren:</strong>
          {' Überprüfe und genehmige Bewertungen in der Bewertungen-Sammlung.'}
        </li>
        <li>
          <strong>Ratgeber-Artikel:</strong>
          {' Erstelle hilfreiche Artikel für Fahrschüler unter Beiträge.'}
        </li>
      </ul>
      {'Tipp: Dieses Banner ist eine '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        benutzerdefinierte Komponente
      </a>
      , du kannst es jederzeit in deiner <strong>payload.config</strong> entfernen.
    </div>
  )
}

export default BeforeDashboard
