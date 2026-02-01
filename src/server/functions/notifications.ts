import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'

// Get user notifications
export const getNotificationsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const notifications = await db.notifications.list([
        Query.equal('userId', [currentUser.$id]),
        Query.equal('isVisible', [true]),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ])

      return { notifications: notifications.rows }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch notifications', status: 500 }
    }
  },
)

// Mark notification as read
const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
})

export const markNotificationReadFn = createServerFn({ method: 'POST' })
  .inputValidator(markNotificationReadSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const notification = await db.notifications.get(data.notificationId)

      // Verify ownership
      if (notification.userId !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      const updated = await db.notifications.update(data.notificationId, {
        isRead: true,
      })

      return { notification: updated }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error marking notification as read:', error)
      setResponseStatus(500)
      throw { message: 'Failed to mark notification as read', status: 500 }
    }
  })

// Mark all notifications as read
export const markAllNotificationsReadFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const { currentUser } = await authMiddleware()

  if (!currentUser) {
    setResponseStatus(401)
    throw { message: 'Unauthorized', status: 401 }
  }

  try {
    const notifications = await db.notifications.list([
      Query.equal('userId', [currentUser.$id]),
      Query.equal('isRead', [false]),
      Query.equal('isVisible', [true]),
    ])

    // Update all unread notifications
    await Promise.all(
      notifications.rows.map((notification) =>
        db.notifications.update(notification.$id, { isRead: true }),
      ),
    )

    return { success: true, count: notifications.rows.length }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    setResponseStatus(500)
    throw { message: 'Failed to mark all notifications as read', status: 500 }
  }
})

// Dismiss notification (hide it)
const dismissNotificationSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
})

export const dismissNotificationFn = createServerFn({ method: 'POST' })
  .inputValidator(dismissNotificationSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const notification = await db.notifications.get(data.notificationId)

      // Verify ownership
      if (notification.userId !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      const updated = await db.notifications.update(data.notificationId, {
        isVisible: false,
      })

      return { notification: updated }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error dismissing notification:', error)
      setResponseStatus(500)
      throw { message: 'Failed to dismiss notification', status: 500 }
    }
  })
