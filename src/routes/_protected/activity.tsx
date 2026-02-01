import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { PageContainer, PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  Bell,
  Shield,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { getNotificationsFn } from '@/server/functions/notifications'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_protected/activity')({
  component: ActivityFeedPage,
})

function ActivityFeedPage() {
  const getNotifications = useServerFn(getNotificationsFn)

  const { data, isLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => await getNotifications(),
    refetchInterval: 30000,
  })

  const activities = data?.notifications || []

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'security':
        return Shield
      case 'account':
        return User
      case 'verification':
        return CheckCircle2
      case 'payment':
        return CreditCard
      case 'alert':
        return AlertTriangle
      default:
        return Bell
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'text-amber-600 bg-amber-100'
      case 'account':
        return 'text-blue-600 bg-blue-100'
      case 'verification':
        return 'text-emerald-600 bg-emerald-100'
      case 'payment':
        return 'text-purple-600 bg-purple-100'
      case 'alert':
        return 'text-rose-600 bg-rose-100'
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Activity Feed"
        description="View all activity and notifications for your account"
      />

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Account Activity Log
              </h2>
              <p className="text-sm text-slate-500">
                {activities.length} total activities
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">
                No Activity Yet
              </h3>
              <p className="text-sm text-slate-500">
                Your account activity will appear here as you use the platform
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)

                return (
                  <div
                    key={activity.$id}
                    className={cn(
                      'p-6 hover:bg-slate-50 transition-colors',
                      !activity.isRead && 'bg-blue-50/50',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                          colorClass,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 mb-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {activity.message}
                            </p>
                          </div>
                          <Badge
                            variant={activity.isRead ? 'secondary' : 'default'}
                            className="flex-shrink-0"
                          >
                            {activity.type}
                          </Badge>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(activity.$createdAt),
                                'MMM d, yyyy',
                              )}{' '}
                              at{' '}
                              {format(new Date(activity.$createdAt), 'h:mm a')}
                            </span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span>
                            {formatDistanceToNow(
                              new Date(activity.$createdAt),
                              { addSuffix: true },
                            )}
                          </span>
                          {!activity.isRead && (
                            <>
                              <span className="text-slate-300">•</span>
                              <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-blue-600 font-medium">
                                  Unread
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Link */}
                        {activity.linkUrl && (
                          <div className="mt-3">
                            <a
                              href={activity.linkUrl}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                            >
                              View details
                              <span aria-hidden="true">→</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </PageContainer>
  )
}
