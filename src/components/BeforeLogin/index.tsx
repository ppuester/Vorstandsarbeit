import React from 'react'
import { Car } from 'lucide-react'

const BeforeLogin: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
          <Car className="w-7 h-7 text-white" />
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">FahrschulFinder Admin</h2>
      <p className="text-sm text-gray-600">
        Willkommen im Verwaltungsbereich. Hier können Fahrschulen, Bewertungen 
        und Inhalte verwaltet werden.
      </p>
    </div>
  )
}

export default BeforeLogin
