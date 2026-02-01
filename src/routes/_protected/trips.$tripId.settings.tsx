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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  UserPlus,
  Users,
  HandHeart,
  Mail,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { format } from 'date-fns'
import { getTripFn, updateTripFn, deleteTripFn } from '@/server/functions/trips'
import {
  getTripFollowersFn,
  inviteFollowerFn,
  removeFollowerFn,
} from '@/server/functions/trips'
import {
  getPrayerIntercessorsFn,
  invitePrayerIntercessorFn,
  removePrayerIntercessorFn,
} from '@/server/functions/trips'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const getTripFollowers = useServerFn(getTripFollowersFn)
  const inviteFollower = useServerFn(inviteFollowerFn)
  const removeFollower = useServerFn(removeFollowerFn)
  const getPrayerIntercessors = useServerFn(getPrayerIntercessorsFn)
  const invitePrayerIntercessor = useServerFn(invitePrayerIntercessorFn)
  const removePrayerIntercessor = useServerFn(removePrayerIntercessorFn)

  const [activeTab, setActiveTab] = useState('general')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showInviteFollowerDialog, setShowInviteFollowerDialog] =
    useState(false)
  const [showInvitePrayerDialog, setShowInvitePrayerDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')

  // Fetch trip data
  const { data, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => await getTrip({ data: { tripId } }),
  })

  const trip = data?.trip

  // Fetch followers
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['trip-followers', tripId],
    queryFn: async () => await getTripFollowers({ data: { tripId } }),
    enabled: activeTab === 'followers',
  })

  const followers = followersData?.followers || []

  // Fetch prayer intercessors
  const { data: intercessorsData, isLoading: intercessorsLoading } = useQuery({
    queryKey: ['prayer-intercessors', tripId],
    queryFn: async () => await getPrayerIntercessors({ data: { tripId } }),
    enabled: activeTab === 'prayer-team',
  })

  const intercessors = intercessorsData?.intercessors || []

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

  // Invite follower mutation
  const inviteFollowerMutation = useMutation({
    mutationFn: async () => {
      return await inviteFollower({
        data: {
          tripId,
          email: inviteEmail.trim(),
          name: inviteName.trim(),
        },
      })
    },
    onSuccess: (data) => {
      toast.success('Invitation sent!', {
        description: `An invitation has been sent to ${inviteEmail}`,
      })
      setShowInviteFollowerDialog(false)
      setInviteEmail('')
      setInviteName('')
      void queryClient.invalidateQueries({
        queryKey: ['trip-followers', tripId],
      })

      // Copy invite link to clipboard
      if (data.inviteLink) {
        void navigator.clipboard.writeText(data.inviteLink)
        toast.info('Invite link copied to clipboard')
      }
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to send invitation', {
        description: error.message || 'Please try again',
      })
    },
  })

  // Invite prayer intercessor mutation
  const invitePrayerMutation = useMutation({
    mutationFn: async () => {
      return await invitePrayerIntercessor({
        data: {
          tripId,
          email: inviteEmail.trim(),
          name: inviteName.trim(),
        },
      })
    },
    onSuccess: (data) => {
      toast.success('Invitation sent!', {
        description: `An invitation has been sent to ${inviteEmail}`,
      })
      setShowInvitePrayerDialog(false)
      setInviteEmail('')
      setInviteName('')
      void queryClient.invalidateQueries({
        queryKey: ['prayer-intercessors', tripId],
      })

      if (data.inviteLink) {
        void navigator.clipboard.writeText(data.inviteLink)
        toast.info('Invite link copied to clipboard')
      }
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to send invitation', {
        description: error.message || 'Please try again',
      })
    },
  })

  // Remove follower mutation
  const removeFollowerMutation = useMutation({
    mutationFn: async (followerId: string) => {
      return await removeFollower({ data: { followerId } })
    },
    onSuccess: () => {
      toast.success('Follower removed')
      void queryClient.invalidateQueries({
        queryKey: ['trip-followers', tripId],
      })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to remove follower', {
        description: error.message || 'Please try again',
      })
    },
  })

  // Remove intercessor mutation
  const removeIntercessorMutation = useMutation({
    mutationFn: async (intercessorId: string) => {
      return await removePrayerIntercessor({ data: { intercessorId } })
    },
    onSuccess: () => {
      toast.success('Prayer intercessor removed')
      void queryClient.invalidateQueries({
        queryKey: ['prayer-intercessors', tripId],
      })
    },
    onError: (error: { message?: string }) => {
      toast.error('Failed to remove prayer intercessor', {
        description: error.message || 'Please try again',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
    toast.info('File upload coming soon')
  }

  const handleSetFeatured = (index: number) => {
    setFeaturedFileIndex(index)
  }

  const handleRemoveFile = (index: number) => {
    const newFileIds = fileIds.filter((_, i) => i !== index)
    setFileIds(newFileIds)
    if (featuredFileIndex === index) {
      setFeaturedFileIndex(0)
    } else if (featuredFileIndex > index) {
      setFeaturedFileIndex(featuredFileIndex - 1)
    }
  }

  const handleInviteFollower = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }
    if (!inviteName.trim()) {
      toast.error('Name is required')
      return
    }
    inviteFollowerMutation.mutate()
  }

  const handleInvitePrayer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }
    if (!inviteName.trim()) {
      toast.error('Name is required')
      return
    }
    invitePrayerMutation.mutate()
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
      <PageHeader title="Trip Settings" description={`Manage ${trip.title}`} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="prayer-team">Prayer Team</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
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
                  Current progress: ${trip.fundraisingProgress.toLocaleString()}{' '}
                  (
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
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      </div>

                      {index === featuredFileIndex && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}

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
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                size="lg"
              >
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
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Trip Followers
                  </h2>
                  <p className="text-sm text-slate-500">
                    People following this trip will receive updates and can
                    donate
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowInviteFollowerDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Follower
              </Button>
            </div>

            {followersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">
                  No Followers Yet
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Invite people to follow this trip and receive updates
                </p>
                <Button onClick={() => setShowInviteFollowerDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Follower
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followers.map((follower) => (
                    <TableRow key={follower.$id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {follower.followerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {follower.followerEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        {follower.inviteToken ? (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">
                          {format(new Date(follower.$createdAt), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeFollowerMutation.mutate(follower.$id)
                          }
                          disabled={removeFollowerMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* Prayer Team Tab */}
        <TabsContent value="prayer-team" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <HandHeart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Prayer Team
                  </h2>
                  <p className="text-sm text-slate-500">
                    Prayer intercessors will receive prayer requests for this
                    trip
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowInvitePrayerDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Intercessor
              </Button>
            </div>

            {intercessorsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : intercessors.length === 0 ? (
              <div className="text-center py-12">
                <HandHeart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">
                  No Prayer Team Yet
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Invite people to join your prayer team and intercede for this
                  trip
                </p>
                <Button onClick={() => setShowInvitePrayerDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Intercessor
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intercessors.map((intercessor) => (
                    <TableRow key={intercessor.$id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {intercessor.intercessorName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {intercessor.intercessorEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        {intercessor.intercessorUserId ? (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-500">
                          {format(
                            new Date(intercessor.$createdAt),
                            'MMM d, yyyy',
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeIntercessorMutation.mutate(intercessor.$id)
                          }
                          disabled={removeIntercessorMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Invite Follower Dialog */}
      <Dialog
        open={showInviteFollowerDialog}
        onOpenChange={setShowInviteFollowerDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Trip Follower</DialogTitle>
            <DialogDescription>
              Send an invitation to follow this trip. They'll receive updates
              and can donate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteFollower} className="space-y-4">
            <div>
              <Label htmlFor="follower-name">Name *</Label>
              <Input
                id="follower-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="follower-email">Email *</Label>
              <Input
                id="follower-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInviteFollowerDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteFollowerMutation.isPending}>
                {inviteFollowerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Prayer Intercessor Dialog */}
      <Dialog
        open={showInvitePrayerDialog}
        onOpenChange={setShowInvitePrayerDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Prayer Intercessor</DialogTitle>
            <DialogDescription>
              Send an invitation to join the prayer team. They'll receive prayer
              requests for this trip.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvitePrayer} className="space-y-4">
            <div>
              <Label htmlFor="intercessor-name">Name *</Label>
              <Input
                id="intercessor-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="intercessor-email">Email *</Label>
              <Input
                id="intercessor-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInvitePrayerDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={invitePrayerMutation.isPending}>
                {invitePrayerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
