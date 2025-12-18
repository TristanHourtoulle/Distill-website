'use client'

import Link from 'next/link'
import { Button, Card, CardContent } from '@/components/ui'
import { CodeBracketIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const handleGitHubLogin = () => {
    // TODO: Implement BetterAuth GitHub OAuth
    console.log('GitHub login clicked')
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
              onClick={handleGitHubLogin}
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
