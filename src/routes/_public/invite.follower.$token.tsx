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
  Users,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Mail,
  User,
  Lock,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getFollowerInviteFn,
  acceptFollowerInviteFn,
} from '@/server/functions/invites'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public/invite/follower/$token')({
  component: FollowerInvitePage,
})

function FollowerInvitePage() {
  const { token } = Route.useParams()
  const router = useRouter()
  const getInvite = useServerFn(getFollowerInviteFn)
  const acceptInvite = useServerFn(acceptFollowerInviteFn)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Fetch invite details
  const { data, isLoading, error } = useQuery({
    queryKey: ['follower-invite', token],
    queryFn: async () => await getInvite({ data: { token } }),
  })

  const invite = data?.invite
  const trip = data?.trip

  // Accept invite mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await acceptInvite({
        data: {
          token,
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
    if (invite?.followerEmail) {
      setEmail(invite.followerEmail)
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            You're Invited to Follow
          </h1>
          <p className="text-slate-600">
            Join as a trip follower to receive updates and support this mission
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
                  placeholder="John"
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
                placeholder="john@example.com"
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

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              As a trip follower, you'll receive updates about this mission trip
              and can donate to support the team.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account & Follow Trip'
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          By creating an account, you agree to receive email updates about this
          trip.
        </p>
      </Card>
    </div>
  )
}
