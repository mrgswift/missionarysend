import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, useEffect } from 'react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Save,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  X,
  Star,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { getTripFn, updateTripFn, deleteTripFn } from '@/server/functions/trips'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/_protected/trips/$tripId/settings')({
  component: TripSettingsPage,
})

function TripSettingsPage() {
  const { tripId } = Route.useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const getTrip = useServerFn(getTripFn)
  const updateTrip = useServerFn(updateTripFn)
  const deleteTrip = useServerFn(deleteTripFn)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch trip data
  const { data, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => await getTrip({ data: { tripId } }),
  })

  const trip = data?.trip

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fundraisingGoal, setFundraisingGoal] = useState('0')
  const [isRestrictedCountry, setIsRestrictedCountry] = useState(false)
  const [fileIds, setFileIds] = useState<string[]>([])
  const [featuredFileIndex, setFeaturedFileIndex] = useState(0)

  // Update form when trip data loads
  useEffect(() => {
    if (trip) {
      setTitle(trip.title)
      setDescription(trip.description || '')
      setLocation(trip.location)
      setStartDate(format(new Date(trip.startDate), 'yyyy-MM-dd'))
      setEndDate(format(new Date(trip.endDate), 'yyyy-MM-dd'))
      setFundraisingGoal(trip.fundraisingGoal.toString())
      setIsRestrictedCountry(trip.isRestrictedCountry)
      setFileIds(trip.fileIds || [])
    }
  }, [trip])

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const startTimestamp = new Date(startDate).getTime()
      const endTimestamp = new Date(endDate).getTime()

      // Reorder fileIds to put featured image first
      const reorderedFileIds = fileIds.length > 0 ? [...fileIds] : null
      if (reorderedFileIds && featuredFileIndex > 0) {
        const featured = reorderedFileIds[featuredFileIndex]
        reorderedFileIds.splice(featuredFileIndex, 1)
        reorderedFileIds.unshift(featured)
      }

      return await updateTrip({
        data: {
          tripId,
          title,
          description: description || null,
          location,
          startDate: startTimestamp,
          endDate: endTimestamp,
          fundraisingGoal: parseInt(fundraisingGoal, 10),
          isRestrictedCountry,
          fileIds: reorderedFileIds,
        },
      })
    },
    onSuccess: () => {
      toast.success('Trip updated successfully!')
      void queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
      void queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to update trip', {
        description: error.message || 'Please try again',
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteTrip({ data: { tripId } })
    },
    onSuccess: async () => {
      toast.success('Trip deleted successfully')
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
      await router.navigate({ to: '/trips' })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to delete trip', {
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

    updateMutation.mutate()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // TODO: Implement file upload to storage
    // For now, just show a placeholder
    toast.info('File upload coming soon')
  }

  const handleSetFeatured = (index: number) => {
    setFeaturedFileIndex(index)
  }

  const handleRemoveFile = (index: number) => {
    const newFileIds = fileIds.filter((_, i) => i !== index)
    setFileIds(newFileIds)
    // Adjust featured index if needed
    if (featuredFileIndex === index) {
      setFeaturedFileIndex(0)
    } else if (featuredFileIndex > index) {
      setFeaturedFileIndex(featuredFileIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </PageContainer>
    )
  }

  if (!trip) {
    return (
      <PageContainer>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Trip not found or you don't have permission to edit it.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Trip Settings"
        description={`Edit details for ${trip.title}`}
      />

      <div className="flex justify-end mb-6">
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Trip
        </Button>
      </div>

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
              Current progress: ${trip.fundraisingProgress.toLocaleString()} (
              {trip.fundraisingGoal > 0
                ? Math.round(
                    (trip.fundraisingProgress / trip.fundraisingGoal) * 100,
                  )
                : 0}
              %)
            </p>
          </div>
        </Card>

        {/* Photo/Video Gallery */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Photo & Video Gallery
              </h2>
              <p className="text-sm text-slate-500">
                The first image will be used as the featured image
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>

          {fileIds.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
              <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">No media uploaded yet</p>
              <p className="text-xs text-slate-400">
                Upload photos and videos to showcase your trip
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fileIds.map((fileId, index) => (
                <div
                  key={fileId}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-slate-300 transition-colors"
                >
                  {/* Placeholder for file preview */}
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-300" />
                  </div>

                  {/* Featured badge */}
                  {index === featuredFileIndex && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {index !== featuredFileIndex && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetFeatured(index)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Featured
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trip.title}"? This action cannot
              be undone. All trip data, donations, and updates will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Trip'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
