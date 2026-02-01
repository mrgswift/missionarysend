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
  MapPin,
  Calendar,
  Settings,
  Image as ImageIcon,
  Lock,
} from 'lucide-react'
import { format } from 'date-fns'
import { getTripsFn } from '@/server/functions/trips'

export const Route = createFileRoute('/_protected/trips/')({
  component: MyTripsPage,
})

function MyTripsPage() {
  const getTrips = useServerFn(getTripsFn)

  const { data, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => await getTrips(),
  })

  const trips = data?.trips || []

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <PageHeader
          title="My Trips"
          description="Manage your mission trips and fundraising campaigns"
        />
        <Link to="/trips/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-36 sm:h-48 w-full" />
              <div className="p-3 md:p-4 space-y-3">
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
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Create Trip
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trips.map((trip) => {
            const progress =
              trip.fundraisingGoal > 0
                ? Math.round(
                    (trip.fundraisingProgress / trip.fundraisingGoal) * 100,
                  )
                : 0

            return (
              <Card
                key={trip.$id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-36 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
                    {trip.isRestrictedCountry && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Restricted</span>
                      </Badge>
                    )}
                    {trip.isActivated ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1 text-sm md:text-base">
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
                  <div className="space-y-1 mb-3 md:mb-4">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-slate-600">
                        ${trip.fundraisingProgress.toLocaleString()} raised
                      </span>
                      <span className="font-medium text-slate-900">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5 md:h-2" />
                    <p className="text-xs text-slate-500">
                      of ${trip.fundraisingGoal.toLocaleString()} goal
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to="/trips/$tripId/settings"
                      params={{ tripId: trip.$id }}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
