'use client'

import { forwardRef } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { SpinnerProps } from './Spinner.types'

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <ArrowPathIcon
          className={cn(
            'animate-spin',
            // Sizes
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-6 w-6',
            size === 'lg' && 'h-8 w-8',
            // Colors
            color === 'primary' && 'text-primary',
            color === 'white' && 'text-white',
            color === 'muted' && 'text-text-muted'
          )}
        />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'
