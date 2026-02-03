import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'
import type { PrayerRequests } from '../lib/appwrite.types'

// Get trips that the current user is following
export const getFollowedTripsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get all follower records for this user
      const followerRecords = await db.tripFollowers.list([
        Query.equal('followerUserId', [currentUser.$id]),
        Query.orderDesc('$createdAt'),
      ])

      if (followerRecords.rows.length === 0) {
        return { trips: [] }
      }

      // Get trip details for each followed trip
      const tripIds = followerRecords.rows.map((f) => f.tripId)
      const trips = await Promise.all(
        tripIds.map(async (tripId) => {
          try {
            const trip = await db.trips.get(tripId)
            return trip
          } catch {
            return null
          }
        }),
      )

      // Filter out any null trips (deleted trips)
      const validTrips = trips.filter((t) => t !== null)

      return { trips: validTrips }
    } catch (error) {
      console.error('Error fetching followed trips:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch followed trips', status: 500 }
    }
  },
)

// Get trips that the current user is praying for
export const getPrayerTripsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get all intercessor records for this user
      const intercessorRecords = await db.prayerIntercessors.list([
        Query.equal('intercessorUserId', [currentUser.$id]),
        Query.orderDesc('$createdAt'),
      ])

      if (intercessorRecords.rows.length === 0) {
        return { trips: [] }
      }

      // Get trip details for each prayer trip
      const tripIds = intercessorRecords.rows.map((i) => i.tripId)
      const trips = await Promise.all(
        tripIds.map(async (tripId) => {
          try {
            const trip = await db.trips.get(tripId)
            return trip
          } catch {
            return null
          }
        }),
      )

      // Filter out any null trips (deleted trips)
      const validTrips = trips.filter((t) => t !== null)

      return { trips: validTrips }
    } catch (error) {
      console.error('Error fetching prayer trips:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch prayer trips', status: 500 }
    }
  },
)

// Get a public trip view (for followers/intercessors)
const getPublicTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const getPublicTripFn = createServerFn({ method: 'GET' })
  .inputValidator(getPublicTripSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get trip details first
      const trip = await db.trips.get(data.tripId)

      // Check if user is the trip creator
      const isTripCreator = trip.createdBy === currentUser.$id

      // Check if user has access (is a follower or intercessor)
      const [followerRecords, intercessorRecords] = await Promise.all([
        db.tripFollowers.list([
          Query.equal('tripId', [data.tripId]),
          Query.equal('followerUserId', [currentUser.$id]),
        ]),
        db.prayerIntercessors.list([
          Query.equal('tripId', [data.tripId]),
          Query.equal('intercessorUserId', [currentUser.$id]),
        ]),
      ])

      const isFollower = followerRecords.rows.length > 0
      const isIntercessor = intercessorRecords.rows.length > 0

      // Allow access if user is creator, follower, or intercessor
      if (!isTripCreator && !isFollower && !isIntercessor) {
        setResponseStatus(403)
        throw { message: 'You do not have access to this trip', status: 403 }
      }

      // Get trip updates
      const updates = await db.tripUpdates.list([
        Query.equal('tripId', [data.tripId]),
        Query.orderDesc('$createdAt'),
        Query.limit(10),
      ])

      // Get prayer requests if user is an intercessor or trip creator
      let prayerRequests: PrayerRequests[] = []
      if (isIntercessor || isTripCreator) {
        const prayerResult = await db.prayerRequests.list([
          Query.equal('tripId', [data.tripId]),
          Query.orderDesc('$createdAt'),
          Query.limit(10),
        ])
        prayerRequests = prayerResult.rows
      }

      return {
        trip,
        updates: updates.rows,
        prayerRequests,
        isFollower,
        isIntercessor,
      }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching public trip:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch trip', status: 500 }
    }
  })
