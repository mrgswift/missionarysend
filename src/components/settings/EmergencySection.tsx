import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  AlertTriangle,
  Lock,
  Unlock,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { lockAccountFn, unlockAccountFn } from '@/server/functions/users'
import type { Users } from '@/server/lib/appwrite.types'

interface EmergencySectionProps {
  profile: Users | null
}

export function EmergencySection({ profile }: EmergencySectionProps) {
  const router = useRouter()
  const lockAccount = useServerFn(lockAccountFn)
  const unlockAccount = useServerFn(unlockAccountFn)

  const [unlockKey, setUnlockKey] = useState('')
  const [showLockDialog, setShowLockDialog] = useState(false)

  const lockMutation = useMutation({
    mutationFn: async () => {
      if (!unlockKey) {
        throw new Error('Please enter your unlock key')
      }
      return await lockAccount()
    },
    onSuccess: () => {
      toast.success('Account locked successfully')
      setShowLockDialog(false)
      setUnlockKey('')
      void router.invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to lock account')
    },
  })

  const unlockMutation = useMutation({
    mutationFn: async () => {
      if (!unlockKey) {
        throw new Error('Please enter your unlock key')
      }
      return await unlockAccount({ data: { unlockKey } })
    },
    onSuccess: () => {
      toast.success('Account unlocked successfully')
      setUnlockKey('')
      void router.invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock account')
    },
  })

  if (!profile) {
    return (
      <div className="text-center py-8">
        <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 mb-2">
          Complete Your Profile First
        </h3>
        <p className="text-sm text-slate-500">
          Please complete your profile information before accessing emergency
          features.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Emergency Actions</h3>
          <p className="text-sm text-slate-500">
            Safety features for emergency situations
          </p>
        </div>
      </div>

      {/* Account Status */}
      {profile.accountLocked ? (
        <Alert className="border-rose-200 bg-rose-50">
          <Lock className="h-4 w-4 text-rose-600" />
          <AlertTitle className="text-rose-800">Account Locked</AlertTitle>
          <AlertDescription className="text-rose-700">
            Your account is currently locked. All trip pages and communications
            are disabled. Enter your unlock key below to restore access.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800">Account Active</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Your account is active and all features are available.
          </AlertDescription>
        </Alert>
      )}

      {/* Lock Account Section */}
      {!profile.accountLocked && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Emergency Account Lock</h4>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              <strong>
                Use this feature if your device is stolen or confiscated.
              </strong>{' '}
              Locking your account will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hide all your trip pages from public view</li>
                <li>Disable all communications and notifications</li>
                <li>
                  Send an automated email to your trip followers about the
                  emergency lock
                </li>
                <li>Protect your personal information and supporter data</li>
              </ul>
            </AlertDescription>
          </Alert>

          <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                Lock My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Lock Your Account?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will immediately lock your account and hide all your
                    trip information. An automated email will be sent to all
                    your trip followers.
                  </p>
                  <p className="font-medium text-slate-900">
                    You will need your unlock key to restore access. Make sure
                    you have it saved in a safe place.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => lockMutation.mutate()}
                  disabled={lockMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {lockMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Locking...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Lock Account
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Unlock Account Section */}
      {profile.accountLocked && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Unlock Your Account</h4>

          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <p className="text-sm text-slate-600">
              Enter your 255-character unlock key to restore access to your
              account.
            </p>

            <div className="space-y-2">
              <Label htmlFor="unlockKey">Unlock Key</Label>
              <Input
                id="unlockKey"
                type="password"
                value={unlockKey}
                onChange={(e) => setUnlockKey(e.target.value)}
                placeholder="Enter your unlock key"
                className="font-mono text-xs"
              />
            </div>

            <Button
              onClick={() => unlockMutation.mutate()}
              disabled={unlockMutation.isPending || unlockKey.length !== 255}
              className="w-full sm:w-auto"
            >
              {unlockMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Unlock Account
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Safety Tips */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">
          Safety Tips for Mission Trips
        </h4>

        <div className="bg-slate-50 rounded-lg p-4">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>
                Store your unlock key in a secure location that you can access
                remotely (e.g., password manager, trusted family member)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>
                <strong>Never</strong> bring your unlock key with you on mission
                trips
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>
                Consider enabling two-factor authentication for additional
                security
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>
                If traveling to a restricted country, ensure you have a plan to
                lock your account if needed
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
