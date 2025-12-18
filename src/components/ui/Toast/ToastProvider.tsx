'use client'

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { Toast } from './Toast'
import type { Toast as ToastType, ToastContextValue } from './Toast.types'

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 5000

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = generateId()
    const newToast: ToastType = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_DURATION,
    }
    setToasts((prev) => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
