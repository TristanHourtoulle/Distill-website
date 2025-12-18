'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'
import type { ToastProps, ToastType } from './Toast.types'

const iconMap: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const styleMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: 'text-success',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: 'text-error',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: 'text-warning',
  },
  info: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: 'text-primary',
  },
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const Icon = iconMap[toast.type]
  const styles = styleMap[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 200)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg',
        'transform transition-all duration-200',
        styles.bg,
        styles.border,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0', styles.icon)} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 rounded p-1',
            'text-text-muted hover:text-text',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
