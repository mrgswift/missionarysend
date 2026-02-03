import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HandHeart,
  Loader2,
  AlertTriangle,
  MapPin,
  Calendar,
  Mail,
  User,
  Lock,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getPrayerInviteFn,
  acceptPrayerInviteFn,
} from '@/server/functions/invites'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
  id: z.string().optional(),
})

export const Route = createFileRoute('/_public/invite/prayer/$token')({
  component: PrayerInvitePage,
  validateSearch: searchSchema,
})

function PrayerInvitePage() {
  const { token } = Route.useParams()
  const { id } = Route.useSearch()
  const router = useRouter()
  const getInvite = useServerFn(getPrayerInviteFn)
  const acceptInvite = useServerFn(acceptPrayerInviteFn)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch invite details
  const { data, isLoading, error } = useQuery({
    queryKey: ['prayer-invite', token, id],
    queryFn: async () => await getInvite({ data: { intercessorId: id || '' } }),
    enabled: !!id,
  })

  const invite = data?.invite
  const trip = data?.trip

  // Accept invite mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await acceptInvite({
        data: {
          intercessorId: id || '',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
      })
    },
    onSuccess: () => {
      toast.success('Account created!', {
        description: 'Please check your email to verify your account.',
      })
      void router.navigate({ to: '/verification-pending' })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to create account', {
        description: error.message || 'Please try again',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    acceptMutation.mutate()
  }

  // Pre-fill email from invite
  useState(() => {
    if (invite?.intercessorEmail) {
      setEmail(invite.intercessorEmail)
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  if (error || !invite || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Invalid or Expired Invitation
          </h1>
          <p className="text-slate-600 mb-6">
            This invitation link is no longer valid. Please contact the trip
            organizer for a new invitation.
          </p>
          <Button onClick={() => router.navigate({ to: '/' })}>
            Go to Homepage
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <HandHeart className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Join the Prayer Team
          </h1>
          <p className="text-slate-600">
            You've been invited to intercede in prayer for this mission trip
          </p>
        </div>

        {/* Trip Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">{trip.title}</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              {trip.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              {format(new Date(trip.startDate), 'MMM d, yyyy')} -{' '}
              {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </div>
          </div>
          {trip.description && (
            <p className="text-sm text-slate-600 mt-3 line-clamp-3">
              {trip.description}
            </p>
          )}
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pl-10"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="pl-10"
                minLength={8}
                required
              />
            </div>
          </div>

          <Alert className="border-purple-200 bg-purple-50">
            <HandHeart className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              As a prayer intercessor, you'll receive prayer requests from the
              mission team and can lift them up in prayer.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account & Join Prayer Team'
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          By creating an account, you agree to receive prayer request emails for
          this trip.
        </p>
      </Card>
    </div>
  )
}
