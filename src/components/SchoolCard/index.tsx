'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Shield,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { FavoriteButton } from '@/components/FavoriteButton'

interface SchoolCardProps {
  school: {
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
  index?: number
  featureLabels?: Record<string, string>
}

export function SchoolCard({ school, index = 0, featureLabels = {} }: SchoolCardProps) {
  return (
    <div
      className="group relative rounded-3xl bg-white border border-slate-100 overflow-hidden card-hover"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton schoolId={school.id} variant="icon" />
      </div>

      <Link href={`/fahrschulen/${school.slug}`}>
        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-slate-50 overflow-hidden">
          {school.logo && typeof school.logo === 'object' && school.logo.url && (
            <Image
              src={school.logo.url}
              alt={school.name}
              fill
              className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
            />
          )}
          {school.featured && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
              ⭐ Empfohlen
            </div>
          )}
          {school.verified && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg shadow-green-500/30">
              <Shield className="w-3.5 h-3.5" />
              Verifiziert
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
            {school.name}
          </h3>

          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {school.street}, {school.postalCode} {school.city}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (school.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-900">
              {school.rating?.toFixed(1) || '–'}
            </span>
            <span className="text-slate-400 text-sm">
              ({school.reviewCount || 0})
            </span>
          </div>

          {/* Short Description */}
          {school.shortDescription && (
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">
              {school.shortDescription}
            </p>
          )}

          {/* License Classes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {school.licenseClasses?.slice(0, 5).map((cls: string) => (
              <span
                key={cls}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
              >
                {cls}
              </span>
            ))}
            {(school.licenseClasses?.length || 0) > 5 && (
              <span className="px-3 py-1 bg-violet-100 text-violet-600 text-xs font-medium rounded-lg">
                +{(school.licenseClasses?.length || 0) - 5}
              </span>
            )}
          </div>

          {/* Features */}
          {school.features && school.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {school.features.slice(0, 3).map((feature: string) => (
                <span
                  key={feature}
                  className="px-3 py-1 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 text-xs font-medium rounded-lg border border-violet-100"
                >
                  {featureLabels[feature] || feature}
                </span>
              ))}
            </div>
          )}

          {/* View Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="inline-flex items-center gap-2 text-violet-600 font-semibold text-sm group-hover:gap-3 transition-all">
              Details ansehen
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
