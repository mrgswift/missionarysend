import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, Loader2, MapPin, Calendar, DollarSign, Info } from 'lucide-react'
import { createTripFn } from '@/server/functions/trips'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/trips/new')({
  component: CreateTripPage,
})

function CreateTripPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const createTrip = useServerFn(createTripFn)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fundraisingGoal, setFundraisingGoal] = useState('0')
  const [isRestrictedCountry, setIsRestrictedCountry] = useState(false)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const startTimestamp = new Date(startDate).getTime()
      const endTimestamp = new Date(endDate).getTime()

      return await createTrip({
        data: {
          title,
          description: description || null,
          location,
          startDate: startTimestamp,
          endDate: endTimestamp,
          fundraisingGoal: parseInt(fundraisingGoal, 10),
          isRestrictedCountry,
        },
      })
    },
    onSuccess: async (data) => {
      toast.success('Trip created successfully!')
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
      await router.navigate({
        to: '/trips/$tripId/settings',
        params: { tripId: data.trip.$id },
      })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to create trip', {
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
    if (!location.trim()) {
      toast.error('Location is required')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Start and end dates are required')
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date')
      return
    }
    if (parseInt(fundraisingGoal, 10) < 0) {
      toast.error('Fundraising goal must be 0 or greater')
      return
    }

    createMutation.mutate()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create New Trip"
        description="Set up your mission trip and start fundraising"
      />

      <Alert className="mb-6">
        <Info className="h-5 w-5" />
        <AlertDescription>
          After creating your trip, you'll be able to add photos, videos, and
          additional details in the trip settings.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Trip Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mission Trip to Guatemala"
                maxLength={200}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your supporters about this mission trip..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {description.length} characters
              </p>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Guatemala City, Guatemala"
                  className="pl-10"
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Switch
                id="restricted"
                checked={isRestrictedCountry}
                onCheckedChange={setIsRestrictedCountry}
              />
              <div>
                <Label htmlFor="restricted" className="cursor-pointer">
                  Restricted Country
                </Label>
                <p className="text-xs text-slate-500">
                  Enable if this location requires extra privacy/security
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Dates */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Trip Dates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Fundraising */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Fundraising Goal
          </h2>
          <div>
            <Label htmlFor="goal">Goal Amount (USD) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="goal"
                type="number"
                value={fundraisingGoal}
                onChange={(e) => setFundraisingGoal(e.target.value)}
                placeholder="5000"
                className="pl-10"
                min="0"
                step="1"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              How much money do you need to raise for this trip?
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending} size="lg">
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Trip...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Trip
              </>
            )}
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
