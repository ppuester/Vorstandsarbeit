'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const rowNumber = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const label = data?.data?.label || 'Neuer Eintrag'
  const type = data?.data?.type === 'dropdown' ? '📁' : '🔗'
  const childCount = data?.data?.type === 'dropdown' && data?.data?.children 
    ? ` (${data.data.children.length} Untereinträge)` 
    : ''

  return <div>{type} {rowNumber}: {label}{childCount}</div>
}
