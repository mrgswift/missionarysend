import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useState, useEffect, useRef } from 'react'
import { PageContainer } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  HandHeart,
  Heart,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  CreditCard,
  Send,
  MessageCircle,
  Reply,
  Trash2,
  Loader2,
  Plus,
} from 'lucide-react'
import { format } from 'date-fns'
import { getPublicTripFn } from '@/server/functions/supporter'
import {
  getCommentsFn,
  createCommentFn,
  deleteCommentFn,
  toggleReactionFn,
} from '@/server/functions/comments'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/trip/$tripId')({
  component: TripViewPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      commentId:
        typeof search.commentId === 'string' ? search.commentId : undefined,
    }
  },
})

function TripViewPage() {
  const { tripId } = Route.useParams()
  const { profile } = Route.useRouteContext()
  const searchParams = Route.useSearch()
  const getPublicTrip = useServerFn(getPublicTripFn)

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-trip', tripId],
    queryFn: async () => await getPublicTrip({ data: { tripId } }),
  })

  const trip = data?.trip
  const updates = data?.updates || []
  const prayerRequests = data?.prayerRequests || []
  const isFollower = data?.isFollower
  const isIntercessor = data?.isIntercessor

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error || !trip) {
    return (
      <PageContainer>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            Trip not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </PageContainer>
    )
  }

  const progress =
    trip.fundraisingGoal > 0
      ? Math.round((trip.fundraisingProgress / trip.fundraisingGoal) * 100)
      : 0

  return (
    <PageContainer>
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div className="h-48 sm:h-64 md:h-80 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {isFollower && (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                <Users className="h-3 w-3 mr-1" />
                Following
              </Badge>
            )}
            {isIntercessor && (
              <Badge className="bg-purple-500 hover:bg-purple-600">
                <HandHeart className="h-3 w-3 mr-1" />
                Prayer Team
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            {trip.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trip.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {format(new Date(trip.startDate), 'MMM d')} -{' '}
                {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
              <span className="sm:hidden">
                {format(new Date(trip.startDate), 'MMM d')} -{' '}
                {format(new Date(trip.endDate), 'MMM d')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Description */}
          {trip.description && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">About This Trip</h2>
              <p className="text-slate-600 whitespace-pre-wrap">
                {trip.description}
              </p>
            </Card>
          )}

          {/* Updates */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Trip Updates</h2>
            {updates.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No updates yet</p>
                <p className="text-sm text-slate-400">
                  Check back later for updates from the mission team
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div
                    key={update.$id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <h3 className="font-medium text-slate-900">
                      {update.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {format(new Date(update.$createdAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-slate-600">{update.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Prayer Requests (only for intercessors) */}
          {isIntercessor && (
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-purple-500" />
                Prayer Requests
              </h2>
              {prayerRequests.length === 0 ? (
                <div className="text-center py-8">
                  <HandHeart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No prayer requests yet</p>
                  <p className="text-sm text-slate-400">
                    The mission team will share prayer requests here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prayerRequests.map((request) => (
                    <div
                      key={request.$id}
                      className="border-l-4 border-purple-500 pl-4 py-2"
                    >
                      <h3 className="font-medium text-slate-900">
                        {request.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2">
                        {format(new Date(request.$createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-slate-600">{request.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Comments Section */}
          <CommentsSection
            tripId={tripId}
            currentUserId={profile?.$id}
            highlightCommentId={searchParams.commentId}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fundraising Progress */}
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Fundraising Progress
            </h3>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${trip.fundraisingProgress.toLocaleString()}
            </div>
            <p className="text-sm text-slate-500 mb-4">
              raised of ${trip.fundraisingGoal.toLocaleString()} goal
            </p>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm font-medium text-slate-700">
              {progress}% funded
            </p>

            {isFollower && <DonationDialog trip={trip} />}
          </Card>

          {/* Trip Details */}
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Trip Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-900">{trip.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500">Dates</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(trip.startDate), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600">
                    to {format(new Date(trip.endDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Your Role */}
          <Card className="p-4 sm:p-6 bg-slate-50">
            <h3 className="font-semibold mb-3">Your Role</h3>
            {isFollower && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Trip Follower</p>
                  <p className="text-sm text-slate-600">
                    You receive updates and can donate to support this trip
                  </p>
                </div>
              </div>
            )}
            {isIntercessor && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <HandHeart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Prayer Intercessor
                  </p>
                  <p className="text-sm text-slate-600">
                    You receive prayer requests and lift up this team in prayer
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

// ============================================
// DONATION DIALOG
// ============================================

interface DonationDialogProps {
  trip: {
    $id: string
    title: string
    fundraisingGoal: number
    fundraisingProgress: number
  }
}

function DonationDialog({ trip }: DonationDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [coverFees, setCoverFees] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const presetAmounts = [25, 50, 100, 250, 500]

  const donationAmount = parseFloat(amount) || 0
  const processingFee = coverFees
    ? Math.round((donationAmount * 0.029 + 0.3) * 100) / 100
    : 0
  const totalAmount = donationAmount + processingFee

  const handleDonate = () => {
    if (donationAmount < 1) {
      toast.error('Minimum donation is $1')
      return
    }

    setIsProcessing(true)

    // Simulate processing (Stripe not connected yet)
    setTimeout(() => {
      setIsProcessing(false)
      toast.info('Stripe not connected', {
        description:
          'Payment processing will be available once the trip organizer connects their Stripe account.',
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4" size="lg">
          <Heart className="h-4 w-4 mr-2" />
          Donate Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Support This Trip
          </DialogTitle>
          <DialogDescription>
            Your donation helps fund {trip.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset Amounts */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Amount
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === String(preset) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(String(preset))}
                  className="text-sm"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount">Or enter custom amount</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="pl-10 text-lg"
              />
            </div>
          </div>

          {/* Cover Processing Fees */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900 text-sm">
                Cover processing fees?
              </p>
              <p className="text-xs text-slate-500">
                Add ${processingFee.toFixed(2)} so 100% goes to the trip
              </p>
            </div>
            <Switch checked={coverFees} onCheckedChange={setCoverFees} />
          </div>

          {/* Summary */}
          {donationAmount > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Donation</span>
                <span>${donationAmount.toFixed(2)}</span>
              </div>
              {coverFees && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Processing fee</span>
                  <span>${processingFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Donate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleDonate}
            disabled={donationAmount < 1 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Donate ${totalAmount.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Secure payment powered by Stripe. Your donation may be tax
            deductible.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// COMMENTS SECTION
// ============================================

interface CommentsSectionProps {
  tripId: string
  currentUserId?: string
  highlightCommentId?: string
}

function CommentsSection({
  tripId,
  currentUserId,
  highlightCommentId,
}: CommentsSectionProps) {
  const queryClient = useQueryClient()
  const getComments = useServerFn(getCommentsFn)
  const createComment = useServerFn(createCommentFn)
  const deleteComment = useServerFn(deleteCommentFn)
  const toggleReaction = useServerFn(toggleReactionFn)

  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [openReactionPopover, setOpenReactionPopover] = useState<string | null>(
    null,
  )
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false)
  const [selectedReactions, setSelectedReactions] = useState<
    {
      type: string
      count: number
      userReacted: boolean
      users: string[]
    }[]
  >([])
  const [highlightedComment, setHighlightedComment] = useState<string | null>(
    highlightCommentId || null,
  )
  const hasScrolledRef = useRef(false)

  const { data, isLoading } = useQuery({
    queryKey: ['comments', tripId],
    queryFn: async () => await getComments({ data: { tripId } }),
  })

  const comments = data?.comments || []

  // Scroll to highlighted comment when data loads
  useEffect(() => {
    if (highlightCommentId && comments.length > 0 && !hasScrolledRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const element = document.getElementById(`comment-${highlightCommentId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          hasScrolledRef.current = true

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedComment(null)
          }, 3000)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [highlightCommentId, comments])

  // Reaction name mapping
  const reactionNames: Record<string, string> = {
    '❤️': 'Love',
    '👍': 'Like',
    '🙏': 'Pray',
    '🎉': 'Celebrate',
    '😢': 'Sad',
    '😮': 'Wow',
  }

  const handleOpenReactionsModal = (reactions: typeof selectedReactions) => {
    setSelectedReactions(reactions)
    setReactionsModalOpen(true)
  }

  const createMutation = useMutation({
    mutationFn: async ({
      content,
      parentCommentId,
    }: {
      content: string
      parentCommentId?: string
    }) => {
      return await createComment({
        data: {
          tripId,
          content,
          parentCommentId: parentCommentId || null,
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', tripId] })
      setNewComment('')
      setReplyContent('')
      setReplyingTo(null)
      toast.success('Comment posted!')
    },
    onError: () => {
      toast.error('Failed to post comment')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await deleteComment({ data: { commentId } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', tripId] })
      toast.success('Comment deleted')
    },
    onError: () => {
      toast.error('Failed to delete comment')
    },
  })

  const reactionMutation = useMutation({
    mutationFn: async ({
      commentId,
      reactionType,
    }: {
      commentId: string
      reactionType: '❤️' | '👍' | '🙏' | '🎉' | '😢' | '😮'
    }) => {
      return await toggleReaction({ data: { commentId, reactionType } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', tripId] })
    },
  })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    createMutation.mutate({ content: newComment.trim() })
  }

  const handleSubmitReply = (parentCommentId: string) => {
    if (!replyContent.trim()) return
    createMutation.mutate({
      content: replyContent.trim(),
      parentCommentId,
    })
  }

  const reactionEmojis: Array<'❤️' | '👍' | '🙏' | '🎉' | '😢' | '😮'> = [
    '❤️',
    '👍',
    '🙏',
    '🎉',
    '😢',
    '😮',
  ]

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-blue-500" />
        Comments ({comments.length})
      </h2>

      {/* Reactions Modal */}
      <Dialog open={reactionsModalOpen} onOpenChange={setReactionsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {selectedReactions.slice(0, 3).map((reaction, idx) => (
                  <span key={idx} className="text-lg">
                    {reaction.type}
                  </span>
                ))}
              </div>
              <span className="text-slate-600">
                {selectedReactions.reduce((sum, r) => sum + r.count, 0)}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {selectedReactions.map((reaction) => (
              <div key={reaction.type} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2 border-b">
                  <span className="text-xl">{reaction.type}</span>
                  <span className="font-semibold text-slate-900">
                    {reactionNames[reaction.type]}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({reaction.count})
                  </span>
                </div>
                <div className="space-y-2">
                  {reaction.users.map((userName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 px-2 hover:bg-slate-50 rounded-lg"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                          {userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{userName}</p>
                      </div>
                      <span className="text-lg">{reaction.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts, encouragement, or questions..."
          className="mb-3 min-h-[80px]"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No comments yet</p>
          <p className="text-sm text-slate-400">
            Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.$id} className="space-y-4">
              {/* Main Comment */}
              <div
                id={`comment-${comment.$id}`}
                className={`flex gap-3 p-3 -m-3 rounded-lg transition-colors duration-500 ${
                  highlightedComment === comment.$id
                    ? 'bg-blue-50 ring-2 ring-blue-200'
                    : ''
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {comment.authorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900">
                      {comment.authorName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(comment.$createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  {/* Reactions */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Reaction Summary - Clickable */}
                    {comment.reactions.length > 0 && (
                      <button
                        onClick={() =>
                          handleOpenReactionsModal(comment.reactions)
                        }
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs text-slate-600 transition-colors cursor-pointer"
                      >
                        <div className="flex -space-x-1">
                          {comment.reactions
                            .slice(0, 3)
                            .map((reaction, idx) => (
                              <span key={idx} className="text-sm">
                                {reaction.type}
                              </span>
                            ))}
                        </div>
                        <span className="ml-1">
                          {comment.reactions.reduce(
                            (sum, r) => sum + r.count,
                            0,
                          )}
                        </span>
                      </button>
                    )}

                    {/* Add Reaction */}
                    <Popover
                      open={openReactionPopover === `comment-${comment.$id}`}
                      onOpenChange={(open) =>
                        setOpenReactionPopover(
                          open ? `comment-${comment.$id}` : null,
                        )
                      }
                    >
                      <PopoverTrigger asChild>
                        <button className="text-slate-400 hover:text-slate-600 text-sm px-2 py-0.5 hover:bg-slate-100 rounded transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="flex gap-1">
                          {reactionEmojis.map((emoji) => (
                            <TooltipProvider key={emoji}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      reactionMutation.mutate({
                                        commentId: comment.$id,
                                        reactionType: emoji,
                                      })
                                      setOpenReactionPopover(null)
                                    }}
                                    className="hover:bg-slate-100 p-2 rounded transition-colors text-lg"
                                  >
                                    {emoji}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs font-medium">
                                    {reactionNames[emoji]}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Reply Button */}
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.$id ? null : comment.$id,
                        )
                      }
                      className="text-slate-500 hover:text-blue-600 text-xs flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      Reply
                    </button>

                    {/* Delete Button (own comments only) */}
                    {comment.createdBy === currentUserId && (
                      <button
                        onClick={() => deleteMutation.mutate(comment.$id)}
                        className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.$id && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-200">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.authorName}...`}
                        className="mb-2 min-h-[60px] text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.$id)}
                          disabled={
                            !replyContent.trim() || createMutation.isPending
                          }
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 sm:ml-12 space-y-4 border-l-2 border-slate-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.$id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                          {reply.authorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900 text-sm">
                            {reply.authorName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(
                              new Date(reply.$createdAt),
                              'MMM d, h:mm a',
                            )}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>

                        {/* Reply Reactions */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Reaction Summary - Clickable */}
                          {reply.reactions.length > 0 && (
                            <button
                              onClick={() =>
                                handleOpenReactionsModal(reply.reactions)
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 hover:bg-slate-100 rounded-full text-xs text-slate-600 transition-colors cursor-pointer"
                            >
                              <div className="flex -space-x-1">
                                {reply.reactions
                                  .slice(0, 3)
                                  .map((reaction, idx) => (
                                    <span key={idx} className="text-sm">
                                      {reaction.type}
                                    </span>
                                  ))}
                              </div>
                              <span className="ml-1">
                                {reply.reactions.reduce(
                                  (sum, r) => sum + r.count,
                                  0,
                                )}
                              </span>
                            </button>
                          )}

                          {/* Add Reaction to Reply */}
                          <Popover
                            open={openReactionPopover === `reply-${reply.$id}`}
                            onOpenChange={(open) =>
                              setOpenReactionPopover(
                                open ? `reply-${reply.$id}` : null,
                              )
                            }
                          >
                            <PopoverTrigger asChild>
                              <button className="text-slate-400 hover:text-slate-600 text-xs px-2 py-0.5 hover:bg-slate-100 rounded transition-colors">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-2"
                              align="start"
                            >
                              <div className="flex gap-1">
                                {reactionEmojis.map((emoji) => (
                                  <TooltipProvider key={emoji}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => {
                                            reactionMutation.mutate({
                                              commentId: reply.$id,
                                              reactionType: emoji,
                                            })
                                            setOpenReactionPopover(null)
                                          }}
                                          className="hover:bg-slate-100 p-2 rounded transition-colors text-lg"
                                        >
                                          {emoji}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs font-medium">
                                          {reactionNames[emoji]}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>

                          {/* Delete Reply */}
                          {reply.createdBy === currentUserId && (
                            <button
                              onClick={() => deleteMutation.mutate(reply.$id)}
                              className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
