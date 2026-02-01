import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  sendEmailVerificationFn,
  getVerificationStatusFn,
} from '@/server/functions/verification'
import { toast } from 'sonner'
import { useEffect } from 'react'

export const Route = createFileRoute('/_auth/verification-pending')({
  component: VerificationPendingPage,
})

function VerificationPendingPage() {
  const router = useRouter()
  const sendEmailVerification = useServerFn(sendEmailVerificationFn)
  const getVerificationStatus = useServerFn(getVerificationStatusFn)

  // Poll verification status every 5 seconds
  const { data: verificationStatus, refetch } = useQuery({
    queryKey: ['verification-status'],
    queryFn: () => getVerificationStatus(),
    refetchInterval: 5000,
  })

  // Redirect to dashboard if email is verified
  useEffect(() => {
    if (verificationStatus?.emailVerified) {
      toast.success('Email verified!', {
        description: 'Redirecting to your dashboard...',
      })
      setTimeout(() => {
        void router.navigate({ to: '/dashboard' })
      }, 1500)
    }
  }, [verificationStatus?.emailVerified, router])

  const resendMutation = useMutation({
    mutationFn: async () => {
      return await sendEmailVerification()
    },
    onSuccess: () => {
      toast.success('Verification email sent!', {
        description: 'Please check your inbox and spam folder.',
      })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to send verification email', {
        description: error.message || 'Please try again later.',
      })
    },
  })

  // If already verified, show success state
  if (verificationStatus?.emailVerified) {
    return (
      <AuthCard
        title="Email Verified!"
        description="Your account has been verified successfully"
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-center text-green-800">
              Your email has been verified. Redirecting you to your dashboard...
            </AlertDescription>
          </Alert>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Verify Your Email"
      description="Please verify your email address to continue"
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-center">
            We've sent a verification email to{' '}
            <strong className="text-foreground">
              {verificationStatus?.email || 'your email address'}
            </strong>
            . Please click the link in the email to verify your account.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="text-center">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes for the email to arrive</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {resendMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Button
            onClick={() => refetch()}
            variant="ghost"
            className="w-full"
            size="sm"
          >
            I've verified my email
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="text-center text-sm text-muted-foreground mb-3">
            Need to use a different email?
          </p>
          <Link to="/sign-out" className="block">
            <Button variant="ghost" className="w-full" size="sm">
              Sign out and try again
            </Button>
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
