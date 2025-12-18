import type { ReactNode } from 'react'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export interface DropdownMenuProps {
  items: DropdownItem[]
  onClose: () => void
  align: 'left' | 'right'
}
