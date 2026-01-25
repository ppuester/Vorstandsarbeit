'use client'

import React from 'react'
import { SchoolCard } from '@/components/SchoolCard'
import { FavoritesBadge } from '@/components/FavoritesBadge'

interface School {
  id: string
  name: string
  slug: string
  street: string
  postalCode: string
  city: string
  rating?: number | null
  reviewCount?: number | null
  verified?: boolean | null
  featured?: boolean | null
  shortDescription?: string | null
  licenseClasses?: string[] | null
  features?: string[] | null
  logo?: {
    url?: string | null
  } | null
}

interface SchoolGridProps {
  schools: School[]
  featureLabels?: Record<string, string>
}

export function SchoolGrid({ schools, featureLabels = {} }: SchoolGridProps) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {schools.map((school, index) => (
          <SchoolCard
            key={school.id}
            school={school}
            index={index}
            featureLabels={featureLabels}
          />
        ))}
      </div>
      <FavoritesBadge />
    </>
  )
}
