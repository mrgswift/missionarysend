import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Plus,
  MapPin,
  Calendar,
  Settings,
  Image as ImageIcon,
  Lock,
  CheckCircle2,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Trips</h1>
          <p className="text-slate-500 mt-1">
            Manage your mission trips and fundraising campaigns
          </p>
        </div>
        <Link to="/trips/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No trips yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Create your first mission trip to start fundraising and sharing
              updates with your supporters.
            </p>
            <Link to="/trips/new">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const progressPercentage =
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
                {/* Trip Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                  {trip.fileIds && trip.fileIds.length > 0 ? (
                    <img
                      src={`/api/files/${trip.fileIds[0]}`}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {trip.isActivated ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                    {trip.isRestrictedCountry && (
                      <Badge variant="destructive">Restricted</Badge>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3 line-clamp-2">
                    {trip.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="line-clamp-1">{trip.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {format(new Date(trip.startDate), 'MMM d')} -{' '}
                        {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Fundraising Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Fundraising</span>
                      <span className="font-semibold text-slate-900">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <span>${trip.fundraisingProgress.toLocaleString()}</span>
                      <span>of ${trip.fundraisingGoal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/trips/${trip.$id}/settings`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    {trip.isActivated && (
                      <Link to={`/trips/${trip.$id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          View Trip
                        </Button>
                      </Link>
                    )}
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
