'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { BadgeProps } from './Badge.types'

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium rounded-sm',
          // Sizes
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-2.5 py-1 text-sm',
          // Default variants
          variant === 'default' && 'bg-surface text-text-secondary border border-border',
          variant === 'primary' && 'bg-primary/15 text-primary',
          variant === 'success' && 'bg-success/15 text-success',
          variant === 'warning' && 'bg-warning/15 text-warning',
          variant === 'error' && 'bg-error/15 text-error',
          variant === 'info' && 'bg-info/15 text-info',
          // Complexity variants
          variant === 'complexity-simple' && 'bg-complexity-simple/15 text-complexity-simple',
          variant === 'complexity-moderate' && 'bg-complexity-moderate/15 text-complexity-moderate',
          variant === 'complexity-critical' && 'bg-complexity-critical/15 text-complexity-critical',
          // Task type variants
          variant === 'task-feature' && 'bg-task-feature/15 text-task-feature',
          variant === 'task-bugfix' && 'bg-task-bugfix/15 text-task-bugfix',
          variant === 'task-modification' && 'bg-task-modification/15 text-task-modification',
          variant === 'task-documentation' && 'bg-task-documentation/15 text-task-documentation',
          variant === 'task-refactor' && 'bg-task-refactor/15 text-task-refactor',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
