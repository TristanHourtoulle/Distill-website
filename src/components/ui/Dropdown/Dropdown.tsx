'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DropdownProps, DropdownMenuProps, DropdownItem } from './Dropdown.types'

function DropdownMenu({ items, onClose, align }: DropdownMenuProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)

  const actionableItems = items.filter((item) => !item.separator)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev + 1
            return next >= actionableItems.length ? 0 : next
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => {
            const next = prev - 1
            return next < 0 ? actionableItems.length - 1 : next
          })
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0) {
            const item = actionableItems[focusedIndex]
            if (!item.disabled && item.onClick) {
              item.onClick()
              onClose()
            }
          }
          break
        case 'Tab':
          onClose()
          break
      }
    },
    [focusedIndex, actionableItems, onClose]
  )

  useEffect(() => {
    menuRef.current?.focus()
  }, [])

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
      onClose()
    }
  }

  let actionIndex = -1

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        'absolute z-50 mt-1 min-w-[160px] rounded-md border',
        'border-border bg-surface py-1 shadow-lg',
        'focus:outline-none',
        align === 'right' ? 'right-0' : 'left-0'
      )}
    >
      {items.map((item) => {
        if (item.separator) {
          return (
            <div
              key={item.id}
              className="my-1 h-px bg-border"
              role="separator"
            />
          )
        }

        actionIndex++
        const currentIndex = actionIndex

        return (
          <button
            key={item.id}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => setFocusedIndex(currentIndex)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-sm text-left',
              'transition-colors',
              item.danger ? 'text-error' : 'text-text',
              focusedIndex === currentIndex && 'bg-surface-hover',
              item.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {item.icon && (
              <span className="h-4 w-4 flex-shrink-0">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <DropdownMenu items={items} onClose={handleClose} align={align} />
      )}
    </div>
  )
}
