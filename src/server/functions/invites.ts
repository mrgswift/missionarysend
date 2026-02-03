import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { db } from '../lib/db'
import { Query, ID, Users, Client } from 'node-appwrite'

// Initialize admin client for account creation
const getAdminClient = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!)
  return client
}

// ============================================
// FOLLOWER INVITES
// ============================================

// Get follower invite details
const getFollowerInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const getFollowerInviteFn = createServerFn({ method: 'GET' })
  .inputValidator(getFollowerInviteSchema)
  .handler(async ({ data }) => {
    try {
      // Find invite by token
      const invites = await db.tripFollowers.list([
        Query.equal('inviteToken', [data.token]),
        Query.limit(1),
      ])

      if (invites.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Invitation not found', status: 404 }
      }

      const invite = invites.rows[0]

      // Check if already accepted
      if (invite.followerUserId) {
        setResponseStatus(400)
        throw {
          message: 'This invitation has already been accepted',
          status: 400,
        }
      }

      // Get trip details
      const trip = await db.trips.get(invite.tripId)

      return {
        invite: {
          $id: invite.$id,
          followerName: invite.followerName,
          followerEmail: invite.followerEmail,
        },
        trip: {
          $id: trip.$id,
          title: trip.title,
          description: trip.description,
          location: trip.location,
          startDate: trip.startDate,
          endDate: trip.endDate,
        },
      }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching follower invite:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch invitation', status: 500 }
    }
  })

// Accept follower invite and create account
const acceptFollowerInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const acceptFollowerInviteFn = createServerFn({ method: 'POST' })
  .inputValidator(acceptFollowerInviteSchema)
  .handler(async ({ data }) => {
    try {
      // Find invite by token
      const invites = await db.tripFollowers.list([
        Query.equal('inviteToken', [data.token]),
        Query.limit(1),
      ])

      if (invites.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Invitation not found', status: 404 }
      }

      const invite = invites.rows[0]

      // Check if already accepted
      if (invite.followerUserId) {
        setResponseStatus(400)
        throw {
          message: 'This invitation has already been accepted',
          status: 400,
        }
      }

      // Create Appwrite account using Users SDK (admin)
      const client = getAdminClient()
      const users = new Users(client)
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`

      let userId: string

      try {
        // Create the user account
        const newUser = await users.create(
          ID.unique(),
          data.email.toLowerCase(),
          undefined, // phone (optional)
          data.password,
          fullName,
        )
        userId = newUser.$id

        // Note: Email verification will be triggered on first sign-in
      } catch (userError: unknown) {
        const error = userError as { code?: number; message?: string }
        if (error.code === 409) {
          setResponseStatus(400)
          throw {
            message: 'An account with this email already exists',
            status: 400,
          }
        }
        throw userError
      }

      // Create user profile in database
      await db.users.create(
        {
          createdBy: userId,
          accountType: 'follower',
          name: fullName,
          email: data.email.toLowerCase(),
          phone: '',
          address: null,
          emergencyContact: null,
          is501c3: false,
          taxDeductible: false,
          stripeAccountId: null,
          unlockKey: ID.unique(),
          accountLocked: false,
          twoFactorEnabled: false,
          avatarFileId: null,
        },
        { rowId: userId },
      )

      // Update follower record with user ID and clear invite token
      await db.tripFollowers.update(invite.$id, {
        followerUserId: userId,
        followerName: fullName,
        followerEmail: data.email.toLowerCase(),
        inviteToken: null,
      })

      return { success: true, userId }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error accepting follower invite:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create account', status: 500 }
    }
  })

// ============================================
// PRAYER INTERCESSOR INVITES
// ============================================

// Get prayer intercessor invite details
const getPrayerInviteSchema = z.object({
  intercessorId: z.string().min(1, 'Intercessor ID is required'),
})

export const getPrayerInviteFn = createServerFn({ method: 'GET' })
  .inputValidator(getPrayerInviteSchema)
  .handler(async ({ data }) => {
    try {
      // Get intercessor record
      const invite = await db.prayerIntercessors.get(data.intercessorId)

      // Check if already accepted
      if (invite.intercessorUserId) {
        setResponseStatus(400)
        throw {
          message: 'This invitation has already been accepted',
          status: 400,
        }
      }

      // Get trip details
      const trip = await db.trips.get(invite.tripId)

      return {
        invite: {
          $id: invite.$id,
          intercessorName: invite.intercessorName,
          intercessorEmail: invite.intercessorEmail,
        },
        trip: {
          $id: trip.$id,
          title: trip.title,
          description: trip.description,
          location: trip.location,
          startDate: trip.startDate,
          endDate: trip.endDate,
        },
      }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching prayer invite:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch invitation', status: 500 }
    }
  })

// Accept prayer intercessor invite and create account
const acceptPrayerInviteSchema = z.object({
  intercessorId: z.string().min(1, 'Intercessor ID is required'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const acceptPrayerInviteFn = createServerFn({ method: 'POST' })
  .inputValidator(acceptPrayerInviteSchema)
  .handler(async ({ data }) => {
    try {
      // Get intercessor record
      const invite = await db.prayerIntercessors.get(data.intercessorId)

      // Check if already accepted
      if (invite.intercessorUserId) {
        setResponseStatus(400)
        throw {
          message: 'This invitation has already been accepted',
          status: 400,
        }
      }

      // Create Appwrite account using Users SDK (admin)
      const client = getAdminClient()
      const users = new Users(client)
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`

      let userId: string

      try {
        // Create the user account
        const newUser = await users.create(
          ID.unique(),
          data.email.toLowerCase(),
          undefined, // phone (optional)
          data.password,
          fullName,
        )
        userId = newUser.$id

        // Note: Email verification will be triggered on first sign-in
      } catch (userError: unknown) {
        const error = userError as { code?: number; message?: string }
        if (error.code === 409) {
          setResponseStatus(400)
          throw {
            message: 'An account with this email already exists',
            status: 400,
          }
        }
        throw userError
      }

      // Create user profile in database
      await db.users.create(
        {
          createdBy: userId,
          accountType: 'intercessor',
          name: fullName,
          email: data.email.toLowerCase(),
          phone: '',
          address: null,
          emergencyContact: null,
          is501c3: false,
          taxDeductible: false,
          stripeAccountId: null,
          unlockKey: ID.unique(),
          accountLocked: false,
          twoFactorEnabled: false,
          avatarFileId: null,
        },
        { rowId: userId },
      )

      // Update intercessor record with user ID
      await db.prayerIntercessors.update(invite.$id, {
        intercessorUserId: userId,
        intercessorName: fullName,
        intercessorEmail: data.email.toLowerCase(),
      })

      return { success: true, userId }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error accepting prayer invite:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create account', status: 500 }
    }
  })
