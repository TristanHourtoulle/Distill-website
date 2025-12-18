'use client'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'
import { Sidebar } from '../Sidebar'
import { Header } from '../Header'
import type { DashboardLayoutProps } from './DashboardLayout.types'

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarOpen, sidebarCollapsed } = useUIStore()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile when closed */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 lg:relative lg:flex',
          sidebarOpen ? 'flex' : 'hidden'
        )}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
