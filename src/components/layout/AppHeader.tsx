import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Menu, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  getNotificationsFn,
  markNotificationReadFn,
  markAllNotificationsReadFn,
  dismissNotificationFn,
} from '@/server/functions/notifications'
import { formatDistanceToNow } from 'date-fns'

interface AppHeaderProps {
  title?: string
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function AppHeader({
  title,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: AppHeaderProps) {
  const { currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const getNotifications = useServerFn(getNotificationsFn)
  const markNotificationRead = useServerFn(markNotificationReadFn)
  const markAllNotificationsRead = useServerFn(markAllNotificationsReadFn)
  const dismissNotification = useServerFn(dismissNotificationFn)

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => await getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const notifications = notificationsData?.notifications || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await markNotificationRead({ data: { notificationId } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await markAllNotificationsRead()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Dismiss notification
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await dismissNotification({ data: { notificationId } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markReadMutation.mutate(notificationId)
    }
    setIsNotificationsOpen(false)
  }

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await dismissMutation.mutateAsync(notificationId)
  }

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left side - Mobile menu toggle and title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {title && (
          <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
            {title}
          </h1>
        )}
      </div>

      {/* Right side - Notifications and user */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover
          open={isNotificationsOpen}
          onOpenChange={setIsNotificationsOpen}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-rose-500 hover:bg-rose-500">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500"
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.$id}
                      className={cn(
                        'relative group',
                        !notification.isRead && 'bg-blue-50',
                      )}
                    >
                      <Link
                        to={notification.linkUrl || '/notifications'}
                        className="block p-4 pr-10 hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          handleNotificationClick(
                            notification.$id,
                            notification.isRead,
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatDistanceToNow(
                                new Date(notification.$createdAt),
                                { addSuffix: true },
                              )}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDismiss(e, notification.$id)}
                      >
                        <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-3 border-t border-slate-200">
              <Link to="/notifications">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => setIsNotificationsOpen(false)}
                >
                  View all notifications
                </Button>
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Avatar */}
        <Link to="/settings">
          <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
            <span className="text-white text-sm font-medium">
              {getInitials(currentUser?.name, currentUser?.email)}
            </span>
          </div>
        </Link>
      </div>
    </header>
  )
}
