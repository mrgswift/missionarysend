import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware } from './auth'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'

// Get donations by trip ID
const getDonationsByTripSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
})

export const getDonationsByTripFn = createServerFn({ method: 'GET' })
  .inputValidator(getDonationsByTripSchema)
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

      // Fetch all donations for this trip
      const donations = await db.donations.list([
        Query.equal('tripId', [data.tripId]),
        Query.orderDesc('$createdAt'),
      ])

      return { donations: donations.rows }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching donations:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch donations', status: 500 }
    }
  })

// Get all donations for current user's trips
export const getAllDonationsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get all user's trips
      const trips = await db.trips.list([
        Query.equal('createdBy', [currentUser.$id]),
      ])

      const tripIds = trips.rows.map((trip) => trip.$id)

      if (tripIds.length === 0) {
        return { donations: [] }
      }

      // Fetch donations for all trips
      const donations = await db.donations.list([
        Query.equal('tripId', tripIds),
        Query.orderDesc('$createdAt'),
      ])

      return { donations: donations.rows }
    } catch (error) {
      console.error('Error fetching all donations:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch donations', status: 500 }
    }
  },
)
