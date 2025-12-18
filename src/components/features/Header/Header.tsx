'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'
import { useAuth } from '@/hooks'
import type { HeaderProps } from './Header.types'

export function Header({ title, className }: HeaderProps) {
  const { toggleSidebar } = useUIStore()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get user initials for avatar
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

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

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name ?? 'User avatar'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                {userInitials}
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text truncate">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  // TODO: Navigate to profile
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
              >
                <UserCircleIcon className="h-4 w-4 text-text-muted" />
                Profile
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false)
                  logout()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-surface-hover transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
