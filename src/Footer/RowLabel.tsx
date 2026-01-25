'use client'
import { Footer } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Footer['navItems']>[number]>()

  const label = data?.data?.link?.label
    ? `${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Neuer Eintrag'

  const category = data?.data?.category === 'legal' ? '⚖️' : '🔗'

  return <div>{category} {label}</div>
}
