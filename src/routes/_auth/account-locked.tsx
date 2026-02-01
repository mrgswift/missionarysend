import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldAlert, Loader2, Unlock } from 'lucide-react'
import { unlockAccountFn } from '@/server/functions/users'
import { toast } from 'sonner'

export const Route = createFileRoute('/_auth/account-locked')({
  component: AccountLockedPage,
})

function AccountLockedPage() {
  const router = useRouter()
  const unlockAccount = useServerFn(unlockAccountFn)
  const [unlockKey, setUnlockKey] = useState('')
  const [error, setError] = useState('')

  const unlockMutation = useMutation({
    mutationFn: async () => {
      return await unlockAccount({ data: { unlockKey } })
    },
    onSuccess: async () => {
      toast.success('Account unlocked successfully!', {
        description: 'Your unlock key has been rotated for security.',
      })
      await router.invalidate()
      // Redirect to dashboard after successful unlock
      await router.navigate({ to: '/dashboard' })
    },
    onError: (error: { message?: string }) => {
      const errorMessage = error.message || 'Invalid unlock key'
      setError(errorMessage)
      toast.error('Failed to unlock account', {
        description: errorMessage,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!unlockKey.trim()) {
      setError('Please enter your unlock key')
      return
    }

    if (unlockKey.length !== 255) {
      setError('Invalid unlock key format')
      return
    }

    unlockMutation.mutate()
  }

  return (
    <AuthCard
      title="Account Locked"
      description="This account has been locked for security reasons"
    >
      <div className="space-y-6">
        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Access Restricted:</strong> This account has been locked.
            Enter your unlock key below to regain access.
          </AlertDescription>
        </Alert>

        {/* Unlock Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlockKey">Unlock Key</Label>
            <Input
              id="unlockKey"
              type="text"
              value={unlockKey}
              onChange={(e) => {
                setUnlockKey(e.target.value)
                setError('')
              }}
              placeholder="Enter your 255-character unlock key"
              className="font-mono text-xs"
              maxLength={255}
              disabled={unlockMutation.isPending}
            />
            <p className="text-xs text-slate-500">
              Your unlock key is 255 characters long. After unlocking, your key
              will be automatically rotated for security.
            </p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={unlockMutation.isPending || !unlockKey}
          >
            {unlockMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unlocking Account...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Account
              </>
            )}
          </Button>
        </form>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600">Don't have your unlock key?</p>
          <p className="text-xs text-slate-500">
            If you've lost your unlock key, you'll need to contact support to
            regain access to your account.
          </p>
        </div>
      </div>
    </AuthCard>
  )
}
