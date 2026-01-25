'use client'

import React from 'react'
import { useOrganization } from '@/providers/Organization'
import { Building2, Check } from 'lucide-react'

export function OrganizationSelector() {
  const { organization, setOrganization, organizationName } = useOrganization()

  const organizations = [
    {
      id: 'lsv-sauerland' as const,
      name: 'LSV Sauerland',
      description: 'Luftsportverein',
    },
    {
      id: 'cdu-stadtverband' as const,
      name: 'CDU Stadtverband',
      description: 'Stadtverband',
    },
    {
      id: 'cdu-fraktion' as const,
      name: 'CDU Fraktion',
      description: 'Fraktion',
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
        Organisation
      </label>
      <div className="flex gap-2">
        {organizations.map((org) => {
          const isActive = organization === org.id
          return (
            <button
              key={org.id}
              onClick={() => setOrganization(org.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-violet-300 hover:bg-violet-50'
              }`}
              title={org.description}
            >
              <Building2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">{org.name}</span>
              <span className="sm:hidden">{org.name.split(' ')[0]}</span>
              {isActive && (
                <Check className="w-4 h-4 text-white ml-1" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
