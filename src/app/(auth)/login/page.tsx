'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, CardContent, Spinner } from '@/components/ui'
import { CodeBracketIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, loginWithGitHub } = useAuth()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-semibold text-text">Distill</h1>
          <p className="text-text-secondary mt-2">
            From meetings to code, distilled.
          </p>
        </div>

        {/* Login card */}
        <Card>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-text">Welcome back</h2>
              <p className="text-sm text-text-secondary mt-1">
                Sign in with your GitHub account
              </p>
            </div>

            <Button
              onClick={loginWithGitHub}
              variant="secondary"
              className="w-full"
              leftIcon={<CodeBracketIcon className="h-5 w-5" />}
            >
              Continue with GitHub
            </Button>

            <p className="text-xs text-text-muted text-center">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-text-muted mt-8">
          Don&apos;t have a GitHub account?{' '}
          <a
            href="https://github.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
