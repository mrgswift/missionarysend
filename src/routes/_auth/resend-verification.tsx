import { createFileRoute, Link } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Route = createFileRoute('/_auth/resend-verification')({
  component: ResendVerificationPage,
})

function ResendVerificationPage() {
  return (
    <AuthCard
      title="Resend Verification Email"
      description="Sign in to request a new verification link"
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-center">
            To resend your verification email, please sign in to your account
            first. You can then request a new verification link from your
            account settings.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Link to="/sign-in" className="block">
            <Button className="w-full" size="lg">
              Sign In to Your Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link to="/sign-up" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Create New Account
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            After signing in, go to{' '}
            <strong className="text-foreground">Account Settings</strong> to
            resend your verification email.
          </p>
        </div>
      </div>
    </AuthCard>
  )
}
