import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HandHeart,
  Send,
  Loader2,
  Info,
  CheckCircle2,
  MapPin,
} from 'lucide-react'
import { getTripsFn } from '@/server/functions/trips'
import { createPrayerRequestFn } from '@/server/functions/prayer'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/prayer')({
  component: PrayerPage,
})

function PrayerPage() {
  const queryClient = useQueryClient()
  const getTrips = useServerFn(getTripsFn)
  const createPrayerRequest = useServerFn(createPrayerRequestFn)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTripId, setSelectedTripId] = useState<string>('')

  // Fetch active trips
  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => await getTrips(),
  })

  const trips = tripsData?.trips || []
  const activeTrips = trips.filter((trip) => trip.isActivated)

  // Create prayer request mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return await createPrayerRequest({
        data: {
          title: title.trim(),
          content: content.trim(),
          tripId: selectedTripId || null,
        },
      })
    },
    onSuccess: () => {
      toast.success('Prayer request submitted!', {
        description:
          'Your prayer request has been shared with your supporters.',
      })
      // Reset form
      setTitle('')
      setContent('')
      setSelectedTripId('')
      void queryClient.invalidateQueries({ queryKey: ['prayer-requests'] })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to submit prayer request', {
        description: error.message || 'Please try again',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (title.length < 3) {
      toast.error('Title must be at least 3 characters')
      return
    }
    if (!content.trim()) {
      toast.error('Prayer request content is required')
      return
    }
    if (content.length < 10) {
      toast.error('Please provide more details about your prayer request')
      return
    }

    createMutation.mutate()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Prayer Requests"
        description="Share prayer requests with your supporters and intercessors"
      />

      <div className="max-w-3xl mx-auto">
        {/* Info Alert */}
        <Alert className="mb-4 md:mb-6">
          <Info className="h-4 w-4 md:h-5 md:w-5" />
          <AlertDescription className="text-xs md:text-sm">
            Submit a prayer request to share with your supporters. You can
            optionally associate it with a specific trip, or leave it general to
            share with all your supporters.
          </AlertDescription>
        </Alert>

        {/* Prayer Request Form */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <HandHeart className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Submit Prayer Request
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Let your supporters know how they can pray for you
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Trip Selection */}
            <div>
              <Label htmlFor="trip" className="text-sm">
                Associated Trip (Optional)
              </Label>
              {tripsLoading ? (
                <Skeleton className="h-10 w-full mt-1" />
              ) : activeTrips.length === 0 ? (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs md:text-sm">
                    You don't have any active trips yet. Your prayer request
                    will be shared with all your supporters.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Select
                    value={selectedTripId}
                    onValueChange={setSelectedTripId}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a trip (or leave blank for general request)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General (All Supporters)</SelectItem>
                      {activeTrips.map((trip) => (
                        <SelectItem key={trip.$id} value={trip.$id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="truncate">
                              {trip.title} - {trip.location}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedTripId
                      ? 'This request will be shared with followers of the selected trip'
                      : 'Leave blank to share with all your supporters'}
                  </p>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm">
                Prayer Request Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Safe travels, Team health, Ministry breakthrough"
                maxLength={200}
                required
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="text-sm">
                Prayer Request Details *
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share the details of your prayer request. Be specific so your supporters know how to pray for you..."
                rows={6}
                className="resize-none mt-1"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {content.length} characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 md:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitle('')
                  setContent('')
                  setSelectedTripId('')
                }}
                disabled={createMutation.isPending}
                className="w-full sm:w-auto"
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
                className="w-full sm:w-auto"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Prayer Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Success Message */}
        {createMutation.isSuccess && (
          <Alert className="mt-4 md:mt-6 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
            <AlertDescription className="text-xs md:text-sm text-emerald-800">
              <strong>Prayer request submitted!</strong> Your supporters will be
              notified and can begin praying for you.
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <Card className="p-4 md:p-6 mt-4 md:mt-6 bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm md:text-base">
            Tips for Prayer Requests
          </h3>
          <ul className="space-y-2 text-xs md:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>
                Be specific about what you need prayer for so supporters know
                how to pray effectively
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>
                Include any relevant context or background information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>
                Consider sharing updates later to let people know how God
                answered their prayers
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>
                Trip-specific requests will only be shared with that trip's
                followers
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </PageContainer>
  )
}
