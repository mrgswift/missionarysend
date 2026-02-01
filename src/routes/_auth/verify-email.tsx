import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { verifyEmailFn } from '@/server/functions/verification'
import { useServerFn } from '@tanstack/react-start'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

const searchSchema = z.object({
  userId: z.string(),
  secret: z.string(),
})

export const Route = createFileRoute('/_auth/verify-email')({
  component: VerifyEmailPage,
  validateSearch: searchSchema,
})

function VerifyEmailPage() {
  const { userId, secret } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const verifyEmail = useServerFn(verifyEmailFn)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail({ data: { userId, secret } })
        setStatus('success')
        toast.success('Email verified!', {
          description: 'Redirecting to your dashboard...',
        })
        // Invalidate router to refresh auth state
        await router.invalidate()
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          void navigate({ to: '/dashboard' })
        }, 2000)
      } catch (error) {
        setStatus('error')
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to verify email. The link may be invalid or expired.'
        setErrorMessage(message)
      }
    }

    void verify()
  }, [userId, secret, verifyEmail, navigate, router])

  return (
    <AuthCard
      title={
        status === 'loading'
          ? 'Verifying Your Email'
          : status === 'success'
            ? 'Email Verified!'
            : 'Verification Failed'
      }
      description={
        status === 'loading'
          ? 'Please wait while we verify your email address'
          : status === 'success'
            ? 'Your account has been successfully verified'
            : 'We could not verify your email address'
      }
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          )}
          {status === 'error' && <XCircle className="h-16 w-16 text-red-600" />}
        </div>

        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-center text-green-800">
              Your email has been verified successfully! Redirecting you to your
              dashboard...
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <>
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-center text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => navigate({ to: '/verification-pending' })}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Request New Verification Link
              </Button>
              <Button
                onClick={() => navigate({ to: '/sign-in' })}
                className="w-full"
                size="lg"
              >
                Go to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'loading' && (
          <p className="text-center text-sm text-muted-foreground">
            This should only take a moment...
          </p>
        )}
      </div>
    </AuthCard>
  )
}
