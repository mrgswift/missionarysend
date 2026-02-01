import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  Shield,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import { getUnlockKeyFn, lockAccountFn } from '@/server/functions/users'
import {
  changePasswordFn,
  setup2FAFn,
  verify2FAFn,
  disable2FAFn,
} from '@/server/functions/security'
import type { Users } from '@/server/lib/appwrite.types'

interface SecuritySectionProps {
  profile: Users | null
}

export function SecuritySection({ profile }: SecuritySectionProps) {
  const router = useRouter()
  const getUnlockKey = useServerFn(getUnlockKeyFn)
  const changePassword = useServerFn(changePasswordFn)
  const setup2FA = useServerFn(setup2FAFn)
  const verify2FA = useServerFn(verify2FAFn)
  const disable2FA = useServerFn(disable2FAFn)
  const lockAccount = useServerFn(lockAccountFn)

  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 2FA setup state
  const [show2FASetupDialog, setShow2FASetupDialog] = useState(false)
  const [show2FADisableDialog, setShow2FADisableDialog] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  // Account lock state
  const [showLockDialog, setShowLockDialog] = useState(false)
  const [lockConfirmation, setLockConfirmation] = useState('')

  // Unlock key state
  const [showUnlockKey, setShowUnlockKey] = useState(false)
  const [unlockKey, setUnlockKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return await changePassword({
        data: {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      })
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      setShowPasswordDialog(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      return await setup2FA()
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShow2FASetupDialog(true)
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to setup 2FA')
    },
  })

  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: async () => {
      return await verify2FA({ data: { code: verificationCode } })
    },
    onSuccess: () => {
      toast.success('2FA enabled successfully')
      setShow2FASetupDialog(false)
      setVerificationCode('')
      setQrCode(null)
      setSecret(null)
      void router.invalidate()
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Invalid verification code')
    },
  })

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      return await disable2FA({ data: { password: disablePassword } })
    },
    onSuccess: () => {
      toast.success('2FA disabled successfully')
      setShow2FADisableDialog(false)
      setDisablePassword('')
      void router.invalidate()
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to disable 2FA')
    },
  })

  // Fetch unlock key mutation
  const fetchUnlockKeyMutation = useMutation({
    mutationFn: async () => {
      return await getUnlockKey()
    },
    onSuccess: (data) => {
      setUnlockKey(data.unlockKey)
      setShowUnlockKey(true)
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to fetch unlock key')
    },
  })

  // Lock account mutation
  const lockAccountMutation = useMutation({
    mutationFn: async () => {
      return await lockAccount()
    },
    onSuccess: async () => {
      toast.success('Account locked successfully', {
        description: 'You will be redirected to the unlock page.',
      })
      setShowLockDialog(false)
      setLockConfirmation('')
      await router.invalidate()
      // User will be automatically redirected by the _protected route loader
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to lock account')
    },
  })

  const handleCopyUnlockKey = async () => {
    if (unlockKey) {
      await navigator.clipboard.writeText(unlockKey)
      setCopied(true)
      toast.success('Unlock key copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRevealUnlockKey = () => {
    if (!unlockKey) {
      fetchUnlockKeyMutation.mutate()
    } else {
      setShowUnlockKey(!showUnlockKey)
    }
  }

  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret)
      toast.success('Secret key copied to clipboard')
    }
  }

  const handle2FAToggle = (checked: boolean) => {
    if (checked) {
      // Enable 2FA - start setup flow
      setup2FAMutation.mutate()
    } else {
      // Disable 2FA - show password confirmation
      setShow2FADisableDialog(true)
    }
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 mb-2">
          Complete Your Profile First
        </h3>
        <p className="text-sm text-slate-500">
          Please complete your profile information before configuring security
          settings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Security Settings</h3>
          <p className="text-sm text-slate-500">
            Manage your password and security preferences
          </p>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-slate-500" />
          <h4 className="font-medium text-slate-900">Password</h4>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700">Change your password</p>
            <p className="text-xs text-slate-500 mt-1">
              We recommend using a strong, unique password
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordDialog(true)}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-slate-500" />
          <h4 className="font-medium text-slate-900">
            Two-Factor Authentication
          </h4>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">Enable 2FA</p>
              <p className="text-xs text-slate-500 mt-1">
                Add an extra layer of security using an authenticator app
              </p>
            </div>
            <Switch
              checked={profile.twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
              disabled={setup2FAMutation.isPending}
            />
          </div>
          {profile.twoFactorEnabled && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Two-factor authentication is enabled
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account Unlock Key */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-slate-500" />
          <h4 className="font-medium text-slate-900">Account Unlock Key</h4>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <strong>Important:</strong> Copy this key to a safe place. You will
            need it to unlock your account if you use the emergency lock
            feature.{' '}
            <strong>NEVER bring this key with you on any mission trips.</strong>
          </AlertDescription>
        </Alert>

        <div className="bg-slate-50 rounded-lg p-4 space-y-4">
          <div>
            <Label className="text-sm text-slate-700">Your Unlock Key</Label>
            <div className="mt-2 relative">
              <Input
                type={showUnlockKey ? 'text' : 'password'}
                value={unlockKey || '••••••••••••••••••••••••••••••••'}
                readOnly
                className="pr-24 font-mono text-xs bg-white"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRevealUnlockKey}
                  disabled={fetchUnlockKeyMutation.isPending}
                  className="h-7 px-2"
                >
                  {fetchUnlockKeyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : showUnlockKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {unlockKey && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyUnlockKey}
                    className="h-7 px-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Account Lock */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-slate-500" />
          <h4 className="font-medium text-slate-900">Emergency Account Lock</h4>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            <strong>Emergency Use Only:</strong> Lock your account immediately
            if your device is lost or stolen. You'll need your unlock key to
            regain access.
          </AlertDescription>
        </Alert>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 font-medium">
                Lock Account Now
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Immediately restrict all access to your account
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowLockDialog(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Lock Account
            </Button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={changePasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => changePasswordMutation.mutate()}
              disabled={
                changePasswordMutation.isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetupDialog} onOpenChange={setShow2FASetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-slate-200">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <div className="w-full space-y-2">
                  <Label className="text-xs text-slate-600">
                    Or enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={secret || ''}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ''))
                }
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-slate-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FASetupDialog(false)
                setVerificationCode('')
                setQrCode(null)
                setSecret(null)
              }}
              disabled={verify2FAMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => verify2FAMutation.mutate()}
              disabled={
                verify2FAMutation.isPending || verificationCode.length !== 6
              }
            >
              {verify2FAMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Dialog */}
      <Dialog
        open={show2FADisableDialog}
        onOpenChange={setShow2FADisableDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Disabling 2FA will make your account less secure
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FADisableDialog(false)
                setDisablePassword('')
              }}
              disabled={disable2FAMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => disable2FAMutation.mutate()}
              disabled={disable2FAMutation.isPending || !disablePassword}
            >
              {disable2FAMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Account Confirmation Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock Your Account?</DialogTitle>
            <DialogDescription>
              This will immediately restrict all access to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                <strong>Warning:</strong> After locking your account, you will
                need your 255-character unlock key to regain access. Make sure
                you have it saved in a secure location.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="lock-confirmation">
                Type <strong>LOCK MY ACCOUNT</strong> to confirm
              </Label>
              <Input
                id="lock-confirmation"
                type="text"
                value={lockConfirmation}
                onChange={(e) => setLockConfirmation(e.target.value)}
                placeholder="LOCK MY ACCOUNT"
              />
            </div>

            <div className="bg-slate-100 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-slate-700">
                What happens when you lock your account:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>All access to your account will be immediately blocked</li>
                <li>You'll be signed out of all devices</li>
                <li>Trip followers will be notified of the lock</li>
                <li>You'll need your unlock key to restore access</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLockDialog(false)
                setLockConfirmation('')
              }}
              disabled={lockAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => lockAccountMutation.mutate()}
              disabled={
                lockAccountMutation.isPending ||
                lockConfirmation !== 'LOCK MY ACCOUNT'
              }
            >
              {lockAccountMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Lock My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
