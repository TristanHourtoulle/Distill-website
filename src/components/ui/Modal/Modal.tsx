'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { ModalProps } from './Modal.types'

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose()
      }
    },
    [onClose, closeOnEscape]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          'relative bg-surface border border-border rounded-xl shadow-xl',
          'w-full max-h-[90vh] overflow-auto',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-xl'
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-text"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-text-secondary"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 p-1 rounded-md',
            'text-text-muted hover:text-text hover:bg-surface-hover',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
          aria-label="Close modal"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') return null

  return createPortal(modalContent, document.body)
}
