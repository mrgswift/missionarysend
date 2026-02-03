import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'

// Create prayer request schema
const createPrayerRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tripId: z.string().nullable().optional(),
})

export const createPrayerRequestFn = createServerFn({ method: 'POST' })
  .inputValidator(createPrayerRequestSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // If tripId is provided, verify ownership
      if (data.tripId) {
        const trip = await db.trips.get(data.tripId)

        if (trip.createdBy !== currentUser.$id) {
          setResponseStatus(403)
          throw { message: 'Forbidden', status: 403 }
        }
      }

      // Create prayer request
      const prayerRequest = await db.prayerRequests.create({
        createdBy: currentUser.$id,
        tripId: data.tripId || '',
        title: data.title.trim(),
        content: data.content.trim(),
        notificationSent: false,
      })

      // TODO: Send notifications to followers/intercessors
      // This would be implemented later when notification system is fully built

      return { prayerRequest }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error creating prayer request:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create prayer request', status: 500 }
    }
  })

// Get prayer requests for a trip
const getPrayerRequestsByTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const getPrayerRequestsByTripFn = createServerFn({ method: 'GET' })
  .inputValidator(getPrayerRequestsByTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Verify trip ownership
      const trip = await db.trips.get(data.tripId)

      if (trip.createdBy !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      // Fetch prayer requests for this trip
      const prayerRequests = await db.prayerRequests.list([
        Query.equal('tripId', [data.tripId]),
        Query.orderDesc('$createdAt'),
      ])

      return { prayerRequests: prayerRequests.rows }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching prayer requests:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch prayer requests', status: 500 }
    }
  })

// Get all prayer requests for current user
export const getAllPrayerRequestsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const prayerRequests = await db.prayerRequests.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.orderDesc('$createdAt'),
      ])

      return { prayerRequests: prayerRequests.rows }
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch prayer requests', status: 500 }
    }
  },
)
