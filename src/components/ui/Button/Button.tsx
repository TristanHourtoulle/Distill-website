'use client'

import { forwardRef } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { ButtonProps } from './Button.types'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' &&
            'bg-primary text-white hover:bg-primary-hover focus:ring-primary/50',
          variant === 'secondary' &&
            'bg-surface border border-border text-text hover:bg-surface-hover focus:ring-border',
          variant === 'ghost' &&
            'bg-transparent text-text hover:bg-surface focus:ring-border',
          variant === 'danger' &&
            'bg-error text-white hover:bg-error-muted focus:ring-error/50',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-sm rounded-md gap-1.5',
          size === 'md' && 'h-10 px-4 text-sm rounded-md gap-2',
          size === 'lg' && 'h-12 px-6 text-base rounded-lg gap-2',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
