'use client'

import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'
import { Button } from '@/components/ui'
import type { HeaderProps } from './Header.types'

export function Header({ title, className }: HeaderProps) {
  const { toggleSidebar, sidebarCollapsed } = useUIStore()

  return (
    <header
      className={cn(
        'flex items-center justify-between h-16 px-6 bg-surface border-b border-border',
        className
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="text-xl font-semibold text-text">{title}</h1>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          className="p-2 rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Notifications"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User avatar placeholder */}
        <button
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm hover:bg-primary/30 transition-colors"
          aria-label="User menu"
        >
          U
        </button>
      </div>
    </header>
  )
}
