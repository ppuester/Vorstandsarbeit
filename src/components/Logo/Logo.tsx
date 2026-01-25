import clsx from 'clsx'
import React from 'react'
import { Car } from 'lucide-react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'default' | 'icon-only'
}

export const Logo = (props: Props) => {
  const { className, variant = 'default' } = props

  if (variant === 'icon-only') {
    return (
      <div className={clsx('w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center', className)}>
        <Car className="w-6 h-6 text-white" />
      </div>
    )
  }

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
        <Car className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight text-slate-900">
          FahrschulFinder
        </span>
        <span className="text-xs text-slate-500">
          Deine Fahrschule finden
        </span>
      </div>
    </div>
  )
}
