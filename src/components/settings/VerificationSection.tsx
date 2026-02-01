import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Loader2,
  Shield,
  Send,
} from 'lucide-react'
import {
  getVerificationStatusFn,
  sendEmailVerificationFn,
  sendPhoneVerificationFn,
  verifyPhoneFn,
  updatePhoneFn,
} from '@/server/functions/verification'
import { useAuth } from '@/hooks/use-auth'
import { formatPhoneForDisplay } from '@/lib/phone-utils'

export function VerificationSection() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [showVerifyCodeDialog, setShowVerifyCodeDialog] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')

  const getVerificationStatus = useServerFn(getVerificationStatusFn)
  const sendEmailVerification = useServerFn(sendEmailVerificationFn)
  const sendPhoneVerification = useServerFn(sendPhoneVerificationFn)
  const verifyPhone = useServerFn(verifyPhoneFn)
  const updatePhone = useServerFn(updatePhoneFn)

  const { data: verificationStatus, refetch } = useQuery({
    queryKey: ['verification-status'],
    queryFn: () => getVerificationStatus(),
  })

  const resendEmailMutation = useMutation({
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

  const updatePhoneMutation = useMutation({
    mutationFn: async () => {
      return await updatePhone({ data: { phone: phoneNumber, password } })
    },
    onSuccess: async () => {
      toast.success('Phone number updated!', {
        description: 'Now sending verification code...',
      })
      setShowPhoneDialog(false)
      setPhoneNumber('')
      setPassword('')
      await refetch()
      // Automatically send verification code
      sendPhoneCodeMutation.mutate()
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to update phone number', {
        description:
          error.message || 'Please check your password and try again.',
      })
    },
  })

  const sendPhoneCodeMutation = useMutation({
    mutationFn: async () => {
      return await sendPhoneVerification()
    },
    onSuccess: () => {
      toast.success('Verification code sent!', {
        description: 'Check your phone for the code.',
      })
      setShowVerifyCodeDialog(true)
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to send verification code', {
        description: error.message || 'Please try again later.',
      })
    },
  })

  const verifyPhoneMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.$id) throw new Error('User not found')
      return await verifyPhone({
        data: { userId: currentUser.$id, secret: verificationCode },
      })
    },
    onSuccess: async () => {
      toast.success('Phone number verified!', {
        description: 'Your phone number has been verified successfully.',
      })
      setShowVerifyCodeDialog(false)
      setVerificationCode('')
      await refetch()
      await router.invalidate()
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to verify phone number', {
        description: error.message || 'Invalid code. Please try again.',
      })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Account Verification</h3>
          <p className="text-sm text-slate-500">
            Verify your email and phone number for enhanced security
          </p>
        </div>
      </div>

      {/* Email Verification */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              verificationStatus?.emailVerified
                ? 'bg-green-100'
                : 'bg-amber-100'
            }`}
          >
            <Mail
              className={`h-5 w-5 ${
                verificationStatus?.emailVerified
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">Email Address</span>
              {verificationStatus?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  Not Verified
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {verificationStatus?.email || currentUser?.email}
            </p>
          </div>
        </div>
        {!verificationStatus?.emailVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => resendEmailMutation.mutate()}
            disabled={resendEmailMutation.isPending}
          >
            {resendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Verification
              </>
            )}
          </Button>
        )}
      </div>

      {/* Phone Verification */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              verificationStatus?.phoneVerified
                ? 'bg-green-100'
                : verificationStatus?.hasPhone
                  ? 'bg-amber-100'
                  : 'bg-slate-200'
            }`}
          >
            <Phone
              className={`h-5 w-5 ${
                verificationStatus?.phoneVerified
                  ? 'text-green-600'
                  : verificationStatus?.hasPhone
                    ? 'text-amber-600'
                    : 'text-slate-400'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">Phone Number</span>
              {verificationStatus?.phoneVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              ) : verificationStatus?.hasPhone ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  Not Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  Not Set
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {verificationStatus?.phone
                ? formatPhoneForDisplay(verificationStatus.phone)
                : 'No phone number added'}
            </p>
          </div>
        </div>
        {!verificationStatus?.phoneVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (verificationStatus?.hasPhone) {
                sendPhoneCodeMutation.mutate()
              } else {
                setShowPhoneDialog(true)
              }
            }}
            disabled={sendPhoneCodeMutation.isPending}
          >
            {sendPhoneCodeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : verificationStatus?.hasPhone ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Verify Phone
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Add Phone
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertDescription className="text-sm">
          Verifying your email and phone number helps secure your account and
          enables important notifications about your mission trips and
          donations.
        </AlertDescription>
      </Alert>

      {/* Add Phone Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Phone Number</DialogTitle>
            <DialogDescription>
              Enter your phone number in any format - we'll format it
              automatically
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 555-1212 or +1-555-555-1212"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Accepts any format: 555-555-1212, (555) 555-1212, +1 555 555
                1212, etc.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Your password is required to update your phone number
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPhoneDialog(false)
                setPhoneNumber('')
                setPassword('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updatePhoneMutation.mutate()}
              disabled={
                updatePhoneMutation.isPending || !phoneNumber || !password
              }
            >
              {updatePhoneMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Phone Number'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Phone Code Dialog */}
      <Dialog
        open={showVerifyCodeDialog}
        onOpenChange={setShowVerifyCodeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogDescription>
              We've sent a verification code to your phone. Enter it below to
              verify your phone number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyCodeDialog(false)
                setVerificationCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => verifyPhoneMutation.mutate()}
              disabled={
                verifyPhoneMutation.isPending || verificationCode.length < 6
              }
            >
              {verifyPhoneMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Phone'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
