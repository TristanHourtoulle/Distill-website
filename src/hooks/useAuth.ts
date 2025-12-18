'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useSession, signIn, signOut } from '@/lib/auth-client'
import type { User } from '@/types/auth'

export interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  loginWithGitHub: () => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const { data: session, isPending, error } = useSession()

  const loginWithGitHub = useCallback(async () => {
    const callbackURL = typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : 'http://localhost:3000/dashboard'

    await signIn.social({
      provider: 'github',
      callbackURL,
    })
  }, [])

  const logout = useCallback(async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }, [router])

  return {
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    error: error ?? null,
    loginWithGitHub,
    logout,
  }
}
