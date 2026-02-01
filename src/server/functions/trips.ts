import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'
import type { Trips } from '../lib/appwrite.types'

// Get all trips for current user
export const getTripsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const trips = await db.trips.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.orderDesc('$createdAt'),
      ])

      return { trips: trips.rows }
    } catch (error) {
      console.error('Error fetching trips:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch trips', status: 500 }
    }
  },
)

// Get single trip by ID
const getTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const getTripFn = createServerFn({ method: 'GET' })
  .inputValidator(getTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const trip = await db.trips.get(data.tripId)

      // Verify ownership
      if (trip.createdBy !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      return { trip }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching trip:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch trip', status: 500 }
    }
  })

// Create trip schema
const createTripSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().nullable().optional(),
  location: z.string().min(2, 'Location is required').max(200),
  startDate: z.number().int().positive('Start date is required'),
  endDate: z.number().int().positive('End date is required'),
  fundraisingGoal: z.number().int().min(0, 'Goal must be 0 or greater'),
  isRestrictedCountry: z.boolean().default(false),
})

export const createTripFn = createServerFn({ method: 'POST' })
  .inputValidator(createTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Validate dates
      if (data.endDate <= data.startDate) {
        setResponseStatus(400)
        throw { message: 'End date must be after start date', status: 400 }
      }

      const trip = await db.trips.create({
        createdBy: currentUser.$id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        location: data.location.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        fundraisingGoal: data.fundraisingGoal,
        fundraisingProgress: 0,
        isRestrictedCountry: data.isRestrictedCountry,
        isActivated: false,
        paymentReceived: false,
        stripePaymentId: null,
        isStarted: false,
        fileIds: null,
      })

      return { trip }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error creating trip:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create trip', status: 500 }
    }
  })

// Update trip schema
const updateTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  title: z.string().min(3).max(200).optional(),
  description: z.string().nullable().optional(),
  location: z.string().min(2).max(200).optional(),
  startDate: z.number().int().positive().optional(),
  endDate: z.number().int().positive().optional(),
  fundraisingGoal: z.number().int().min(0).optional(),
  isRestrictedCountry: z.boolean().optional(),
  fileIds: z.array(z.string()).nullable().optional(),
})

export const updateTripFn = createServerFn({ method: 'POST' })
  .inputValidator(updateTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const trip = await db.trips.get(data.tripId)

      // Verify ownership
      if (trip.createdBy !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      // Build update payload
      const updateData: Partial<
        Omit<Trips, keyof import('node-appwrite').Models.Row>
      > = {}

      if (data.title !== undefined) updateData.title = data.title.trim()
      if (data.description !== undefined)
        updateData.description = data.description?.trim() || null
      if (data.location !== undefined)
        updateData.location = data.location.trim()
      if (data.startDate !== undefined) updateData.startDate = data.startDate
      if (data.endDate !== undefined) updateData.endDate = data.endDate
      if (data.fundraisingGoal !== undefined)
        updateData.fundraisingGoal = data.fundraisingGoal
      if (data.isRestrictedCountry !== undefined)
        updateData.isRestrictedCountry = data.isRestrictedCountry
      if (data.fileIds !== undefined) updateData.fileIds = data.fileIds

      // Validate dates if both are provided
      const startDate = data.startDate ?? trip.startDate
      const endDate = data.endDate ?? trip.endDate
      if (endDate <= startDate) {
        setResponseStatus(400)
        throw { message: 'End date must be after start date', status: 400 }
      }

      const updated = await db.trips.update(data.tripId, updateData)

      return { trip: updated }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error updating trip:', error)
      setResponseStatus(500)
      throw { message: 'Failed to update trip', status: 500 }
    }
  })

// Delete trip
const deleteTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const deleteTripFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const trip = await db.trips.get(data.tripId)

      // Verify ownership
      if (trip.createdBy !== currentUser.$id) {
        setResponseStatus(403)
        throw { message: 'Forbidden', status: 403 }
      }

      await db.trips.delete(data.tripId)

      return { success: true }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error deleting trip:', error)
      setResponseStatus(500)
      throw { message: 'Failed to delete trip', status: 500 }
    }
  })
