'use client'

import { forwardRef, useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'
import type { SelectProps } from './Select.types'

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      label,
      error,
      hint,
      disabled = false,
      required = false,
      className,
      id,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const [focusedIndex, setFocusedIndex] = useState(-1)

    const currentValue = value !== undefined ? value : internalValue
    const selectedOption = options.find((opt) => opt.value === currentValue)

    const handleSelect = useCallback(
      (optionValue: string) => {
        if (value === undefined) {
          setInternalValue(optionValue)
        }
        onChange?.(optionValue)
        setIsOpen(false)
      },
      [value, onChange]
    )

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return

        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault()
            if (isOpen && focusedIndex >= 0) {
              const option = options[focusedIndex]
              if (!option.disabled) {
                handleSelect(option.value)
              }
            } else {
              setIsOpen(true)
            }
            break
          case 'Escape':
            setIsOpen(false)
            break
          case 'ArrowDown':
            e.preventDefault()
            if (!isOpen) {
              setIsOpen(true)
            } else {
              setFocusedIndex((prev) => {
                const next = prev + 1
                return next >= options.length ? 0 : next
              })
            }
            break
          case 'ArrowUp':
            e.preventDefault()
            if (isOpen) {
              setFocusedIndex((prev) => {
                const next = prev - 1
                return next < 0 ? options.length - 1 : next
              })
            }
            break
          case 'Tab':
            setIsOpen(false)
            break
        }
      },
      [disabled, isOpen, focusedIndex, options, handleSelect]
    )

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

    useEffect(() => {
      if (isOpen) {
        const currentIndex = options.findIndex(
          (opt) => opt.value === currentValue
        )
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
      }
    }, [isOpen, options, currentValue])

    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-text"
          >
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            type="button"
            id={id}
            name={name}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={label ? id : undefined}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm',
              'bg-surface text-text transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              error
                ? 'border-error focus:ring-error/50'
                : 'border-border hover:border-border-strong',
              disabled && 'cursor-not-allowed opacity-50',
              !selectedOption && 'text-text-muted'
            )}
          >
            <span className="truncate">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronDownIcon
              className={cn(
                'h-5 w-5 text-text-muted transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <ul
              ref={listRef}
              role="listbox"
              aria-label={label}
              className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border',
                'border-border bg-surface py-1 shadow-lg'
              )}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === currentValue}
                  aria-disabled={option.disabled}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                    option.value === currentValue && 'bg-primary/10 text-primary',
                    focusedIndex === index &&
                      option.value !== currentValue &&
                      'bg-surface-hover',
                    option.disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === currentValue && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {hint && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
