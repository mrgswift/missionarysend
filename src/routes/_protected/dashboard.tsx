import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { PageContainer, PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  MapPin,
  HandHeart,
  Heart,
  Image as ImageIcon,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { getTripsFn } from '@/server/functions/trips'
import {
  getFollowedTripsFn,
  getPrayerTripsFn,
} from '@/server/functions/supporter'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { profile } = Route.useRouteContext()
  const accountType = profile?.accountType || 'individual'

  // Render different dashboards based on account type
  if (accountType === 'follower') {
    return <FollowerDashboard />
  }

  if (accountType === 'intercessor') {
    return <IntercessorDashboard />
  }

  // Default: Missionary/Organization dashboard
  return <MissionaryDashboard />
}

// ============================================
// MISSIONARY DASHBOARD
// ============================================

function MissionaryDashboard() {
  const { profile } = Route.useRouteContext()
  const getTrips = useServerFn(getTripsFn)

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => await getTrips(),
  })

  const trips = tripsData?.trips || []
  const activeTrips = trips.filter((t) => t.isActivated)
  const totalRaised = trips.reduce((sum, t) => sum + t.fundraisingProgress, 0)

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'Missionary'}!`}
        description="Manage your mission trips and track your fundraising progress"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Active Trips
            </span>
            <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">
            {activeTrips.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            {trips.length} total trips
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Total Raised
            </span>
            <DollarSign className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">
            ${totalRaised.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Across all trips
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Followers
            </span>
            <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Build your support team
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Donations
            </span>
            <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            No donations yet
          </p>
        </Card>
      </div>

      {/* Trips or Empty State */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 md:h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Plus className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Create Your First Trip
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Start your mission trip fundraising journey. Set up your trip
              page, share your story, and begin accepting donations.
            </p>
            <Link to="/trips/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Trip
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mt-4">
              {profile?.accountType === 'organization'
                ? 'Unlimited trips included in your plan'
                : 'Pay $10 when you activate fundraising'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold">Your Trips</h2>
            <Link to="/trips/new">
              <Button size="sm" className="md:size-default">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">New Trip</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {trips.slice(0, 6).map((trip) => (
              <TripCard
                key={trip.$id}
                trip={trip}
                linkTo={`/trips/${trip.$id}/settings`}
                buttonLabel="Settings"
              />
            ))}
          </div>
          {trips.length > 6 && (
            <div className="text-center mt-6">
              <Link to="/trips">
                <Button variant="outline">View All Trips</Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <h4 className="font-semibold mb-2 text-sm md:text-base">
            Complete Your Profile
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            Add more details to help donors connect with your mission
          </p>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              Go to Settings
            </Button>
          </Link>
        </Card>

        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow">
          <h4 className="font-semibold mb-2 text-sm md:text-base">
            Connect Stripe
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            Set up payment processing to accept donations
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </Card>

        <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
          <h4 className="font-semibold mb-2 text-sm md:text-base">
            Invite Supporters
          </h4>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            Invite followers and prayer partners to support your trips
          </p>
          <Link to="/trips">
            <Button variant="outline" size="sm">
              Manage Trips
            </Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  )
}

// ============================================
// FOLLOWER DASHBOARD
// ============================================

function FollowerDashboard() {
  const { profile } = Route.useRouteContext()
  const getFollowedTrips = useServerFn(getFollowedTripsFn)

  const { data, isLoading } = useQuery({
    queryKey: ['followed-trips'],
    queryFn: async () => await getFollowedTrips(),
  })

  const trips = data?.trips || []

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${profile?.name?.split(' ')[0] || 'Supporter'}!`}
        description="Stay connected with the mission trips you're following"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Following
            </span>
            <Users className="h-4 w-4 text-blue-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Mission trips you're supporting
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Donated
            </span>
            <Heart className="h-4 w-4 text-rose-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">$0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Total contributed
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Updates
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            New updates this week
          </p>
        </Card>
      </div>

      {/* Trips */}
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
        Trips You're Following
      </h2>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 md:h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Users className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">No Trips Yet</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              You haven't been invited to follow any trips yet. When a
              missionary invites you, their trip will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.$id}
              trip={trip}
              linkTo={`/trip/${trip.$id}`}
              buttonLabel="View Trip"
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

// ============================================
// INTERCESSOR DASHBOARD
// ============================================

function IntercessorDashboard() {
  const { profile } = Route.useRouteContext()
  const getPrayerTrips = useServerFn(getPrayerTripsFn)

  const { data, isLoading } = useQuery({
    queryKey: ['prayer-trips'],
    queryFn: async () => await getPrayerTrips(),
  })

  const trips = data?.trips || []

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${profile?.name?.split(' ')[0] || 'Prayer Warrior'}!`}
        description="Intercede in prayer for the mission trips you're supporting"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Prayer Teams
            </span>
            <HandHeart className="h-4 w-4 text-purple-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">{trips.length}</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Trips you're praying for
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Requests
            </span>
            <Heart className="h-4 w-4 text-rose-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            Active requests
          </p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">
              Updates
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500 hidden sm:block" />
          </div>
          <div className="text-2xl md:text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            New updates this week
          </p>
        </Card>
      </div>

      {/* Trips */}
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
        Trips You're Praying For
      </h2>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 md:h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <HandHeart className="h-7 w-7 md:h-8 md:w-8 text-purple-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              No Prayer Teams Yet
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              You haven't been invited to any prayer teams yet. When a
              missionary invites you, their trip will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.$id}
              trip={trip}
              linkTo={`/trip/${trip.$id}`}
              buttonLabel="View Trip"
              isPrayer
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

// ============================================
// SHARED TRIP CARD COMPONENT
// ============================================

interface TripCardProps {
  trip: {
    $id: string
    title: string
    location: string
    startDate: number
    endDate: number
    fundraisingGoal: number
    fundraisingProgress: number
    isActivated: boolean
    fileIds: string[] | null
  }
  linkTo: string
  buttonLabel?: string
  isPrayer?: boolean
}

function TripCard({
  trip,
  linkTo,
  buttonLabel = 'View',
  isPrayer,
}: TripCardProps) {
  const progress =
    trip.fundraisingGoal > 0
      ? Math.round((trip.fundraisingProgress / trip.fundraisingGoal) * 100)
      : 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="h-36 sm:h-40 md:h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
        <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
        {isPrayer && (
          <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-purple-500 hover:bg-purple-600 text-xs">
            <HandHeart className="h-3 w-3 mr-1" />
            Prayer
          </Badge>
        )}
        {!isPrayer && trip.isActivated && (
          <Badge className="absolute top-2 right-2 md:top-3 md:right-3 bg-emerald-500 hover:bg-emerald-600 text-xs">
            Active
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm md:text-base">
          {trip.title}
        </h3>
        <div className="flex items-center gap-1 text-xs md:text-sm text-slate-500 mb-1 md:mb-2">
          <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          <span className="line-clamp-1">{trip.location}</span>
        </div>
        <div className="flex items-center gap-1 text-xs md:text-sm text-slate-500 mb-2 md:mb-3">
          <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          <span>
            {format(new Date(trip.startDate), 'MMM d')} -{' '}
            {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-slate-600">
              ${trip.fundraisingProgress.toLocaleString()} raised
            </span>
            <span className="font-medium text-slate-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 md:h-2" />
          <p className="text-xs text-slate-500">
            of ${trip.fundraisingGoal.toLocaleString()} goal
          </p>
        </div>

        {/* Action Button */}
        <Link to={linkTo}>
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {buttonLabel}
          </Button>
        </Link>
      </div>
    </Card>
  )
}
