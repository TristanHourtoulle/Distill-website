'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronDownIcon,
  CheckIcon,
  CodeBracketIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import type { BranchSelectorProps } from './BranchSelector.types'

export function BranchSelector({
  branches,
  selectedBranch,
  defaultBranch,
  onChange,
  isLoading = false,
  disabled = false,
  label,
  error,
  className,
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredBranches = useMemo(() => {
    if (!search.trim()) return branches
    const query = search.toLowerCase()
    return branches.filter((branch) =>
      branch.name.toLowerCase().includes(query)
    )
  }, [branches, search])

  const selectedBranchData = branches.find((b) => b.name === selectedBranch)

  const handleSelect = useCallback(
    (branchName: string) => {
      onChange(branchName)
      setIsOpen(false)
      setSearch('')
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || isLoading) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          if (isOpen && focusedIndex >= 0 && focusedIndex < filteredBranches.length) {
            handleSelect(filteredBranches[focusedIndex].name)
          } else if (!isOpen) {
            setIsOpen(true)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSearch('')
          break
        case 'ArrowDown':
          e.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setFocusedIndex((prev) => {
              const next = prev + 1
              return next >= filteredBranches.length ? 0 : next
            })
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (isOpen) {
            setFocusedIndex((prev) => {
              const next = prev - 1
              return next < 0 ? filteredBranches.length - 1 : next
            })
          }
          break
      }
    },
    [disabled, isLoading, isOpen, focusedIndex, filteredBranches, handleSelect]
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1)
    }
  }, [isOpen, search])

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-text">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          disabled={disabled || isLoading}
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-sm',
            'bg-surface text-text transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            error
              ? 'border-error focus:ring-error/50'
              : 'border-border hover:border-border-strong',
            (disabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CodeBracketIcon className="h-4 w-4 flex-shrink-0 text-text-muted" />
            {isLoading ? (
              <span className="text-text-muted">Loading branches...</span>
            ) : selectedBranchData ? (
              <>
                <span className="truncate">{selectedBranchData.name}</span>
                {selectedBranchData.protected && (
                  <LockClosedIcon className="h-3 w-3 flex-shrink-0 text-warning" />
                )}
                {selectedBranchData.name === defaultBranch && (
                  <span className="flex-shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                    default
                  </span>
                )}
              </>
            ) : (
              <span className="text-text-muted">Select a branch</span>
            )}
          </div>

          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <ChevronDownIcon
              className={cn(
                'h-5 w-5 flex-shrink-0 text-text-muted transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          )}
        </button>

        {isOpen && !isLoading && (
          <div
            className={cn(
              'absolute z-50 mt-1 w-full rounded-md border',
              'border-border bg-surface shadow-lg'
            )}
          >
            {/* Search input */}
            <div className="border-b border-border p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search branches..."
                  className={cn(
                    'h-8 w-full rounded border border-border bg-background pl-8 pr-3 text-sm',
                    'placeholder:text-text-muted',
                    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50'
                  )}
                />
              </div>
            </div>

            {/* Branch list */}
            <ul
              role="listbox"
              className="max-h-60 overflow-auto py-1"
            >
              {filteredBranches.length === 0 ? (
                <li className="px-3 py-2 text-sm text-text-muted">
                  No branches found
                </li>
              ) : (
                filteredBranches.map((branch, index) => (
                  <li
                    key={branch.name}
                    role="option"
                    aria-selected={branch.name === selectedBranch}
                    onClick={() => handleSelect(branch.name)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                      branch.name === selectedBranch && 'bg-primary/10 text-primary',
                      focusedIndex === index &&
                        branch.name !== selectedBranch &&
                        'bg-surface-hover'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{branch.name}</span>
                      {branch.protected && (
                        <LockClosedIcon className="h-3 w-3 flex-shrink-0 text-warning" />
                      )}
                      {branch.name === defaultBranch && (
                        <span className="flex-shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                          default
                        </span>
                      )}
                    </div>
                    {branch.name === selectedBranch && (
                      <CheckIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  )
}
