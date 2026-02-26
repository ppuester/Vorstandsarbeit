'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type FooterNavItem = {
  category?: 'navigation' | 'legal' | null
  link?: { label?: string }
}

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<FooterNavItem>()

  const label = data?.data?.link?.label
    ? `${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Neuer Eintrag'

  const category = data?.data?.category === 'legal' ? '⚖️' : '🔗'

  return <div>{category} {label}</div>
}
