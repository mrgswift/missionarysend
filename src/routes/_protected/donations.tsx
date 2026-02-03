import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  Heart,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { getTripsFn } from '@/server/functions/trips'
import { getDonationsByTripFn } from '@/server/functions/donations'

export const Route = createFileRoute('/_protected/donations')({
  component: DonationsPage,
})

function DonationsPage() {
  const getTrips = useServerFn(getTripsFn)
  const getDonationsByTrip = useServerFn(getDonationsByTripFn)

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  // Fetch all trips
  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => await getTrips(),
  })

  const trips = tripsData?.trips || []

  // Fetch donations for selected trip
  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', selectedTripId],
    queryFn: async () => {
      if (!selectedTripId) return { donations: [] }
      return await getDonationsByTrip({ data: { tripId: selectedTripId } })
    },
    enabled: !!selectedTripId,
  })

  const donations = donationsData?.donations || []
  const selectedTrip = trips.find((t) => t.$id === selectedTripId)

  // Calculate totals
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalProcessingFees = donations.reduce(
    (sum, d) => sum + d.processingFeeAmount,
    0,
  )
  const netAmount = totalDonations - totalProcessingFees
  const donationCount = donations.length

  return (
    <PageContainer>
      <PageHeader
        title="Donations"
        description="View and manage donations for your mission trips"
      />

      {/* Trip Selector */}
      <Card className="p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Select Trip
            </label>
            {tripsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : trips.length === 0 ? (
              <div className="text-sm text-slate-500">
                No trips found. Create a trip to start receiving donations.
              </div>
            ) : (
              <Select
                value={selectedTripId || undefined}
                onValueChange={setSelectedTripId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a trip to view donations" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.$id} value={trip.$id}>
                      {trip.title} - {trip.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {selectedTripId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-slate-500 truncate">
                  Total Raised
                </p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  ${totalDonations.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Heart className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-slate-500 truncate">
                  Donations
                </p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  {donationCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-slate-500 truncate">
                  Fees
                </p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  ${totalProcessingFees.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-slate-500 truncate">
                  Net Amount
                </p>
                <p className="text-lg md:text-2xl font-bold text-slate-900">
                  ${netAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Donations Ledger */}
      <Card>
        <div className="p-4 md:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Donation Ledger
              </h2>
              {selectedTrip && (
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  {selectedTrip.title}
                </p>
              )}
            </div>
            {selectedTripId && donations.length > 0 && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile-friendly donation list */}
        {!selectedTripId ? (
          <div className="p-8 md:p-12 text-center">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">Select a Trip</h3>
            <p className="text-sm text-slate-500">
              Choose a trip from the dropdown above to view its donation ledger
            </p>
          </div>
        ) : donationsLoading ? (
          <div className="p-6 md:p-12">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-6 w-20 md:w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">
              No Donations Yet
            </h3>
            <p className="text-sm text-slate-500">
              This trip hasn't received any donations yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.map((donation) => {
              const netDonation = donation.amount - donation.processingFeeAmount

              return (
                <div key={donation.$id} className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {donation.donorName || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-1 text-xs md:text-sm text-slate-500">
                            <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                            <span className="truncate">
                              {donation.donorEmail}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-lg md:text-xl font-bold text-emerald-600">
                            ${donation.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            Net: ${netDonation.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(donation.$createdAt), 'MMM d, yyyy')}
                        </div>
                        {donation.coverProcessingFee && (
                          <Badge variant="secondary" className="text-xs">
                            Fee Covered
                          </Badge>
                        )}
                        {donation.receiptSent ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Receipt Sent
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer Summary */}
        {selectedTripId && donations.length > 0 && (
          <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Showing {donations.length} donation
                {donations.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Total Raised</div>
                  <div className="text-base md:text-lg font-bold text-slate-900">
                    ${totalDonations.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Net Amount</div>
                  <div className="text-base md:text-lg font-bold text-emerald-600">
                    ${netAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
