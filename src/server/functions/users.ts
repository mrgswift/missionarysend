import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'
import { authMiddleware } from './auth'
import { setResponseStatus } from '@tanstack/react-start/server'
import type { Users } from '../lib/appwrite.types'
import { Permission, Role } from 'node-appwrite'

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  if (!digitsOnly) return ''
  return `+${digitsOnly}`
}

// Generate a secure unlock key (255 characters)
function generateUnlockKey(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  const randomValues = new Uint8Array(255)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < 255; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

// Get current user's profile
export const getUserProfileFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      return null
    }

    try {
      // Try to get existing profile
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length > 0) {
        return profiles.rows[0]
      }

      // No profile exists yet - return null (will be created on first save)
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },
)

// Create user profile schema
const createProfileSchema = z.object({
  accountType: z.enum(['missionary', 'organization']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  is501c3: z.boolean().default(false),
  taxDeductible: z.boolean().default(false),
})

// Create user profile
export const createUserProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(createProfileSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Check if profile already exists
      const existing = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (existing.rows.length > 0) {
        setResponseStatus(400)
        throw { message: 'Profile already exists', status: 400 }
      }

      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(data.phone)

      // Validate phone has enough digits
      const phoneDigits = normalizedPhone.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        setResponseStatus(400)
        throw {
          message: 'Phone number must have at least 10 digits',
          status: 400,
        }
      }

      // Generate unlock key
      const unlockKey = generateUnlockKey()

      const profile = await db.users.create({
        createdBy: currentUser.$id,
        accountType: data.accountType,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: normalizedPhone,
        address: data.address?.trim() || null,
        emergencyContact: data.emergencyContact?.trim() || null,
        is501c3: data.is501c3,
        taxDeductible: data.taxDeductible,
        stripeAccountId: null,
        unlockKey,
        accountLocked: false,
        twoFactorEnabled: false,
      })

      return { profile }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error creating user profile:', error)
      setResponseStatus(500)
      throw { message: 'Failed to create profile', status: 500 }
    }
  })

// Update user profile schema
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  address: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  is501c3: z.boolean().optional(),
  taxDeductible: z.boolean().optional(),
})

// Update user profile
export const updateUserProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(updateProfileSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      // Get existing profile
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Profile not found', status: 404 }
      }

      const profile = profiles.rows[0]

      // Build update payload
      const updateData: Partial<
        Omit<Users, '$id' | '$createdAt' | '$updatedAt' | 'createdBy'>
      > = {}

      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.phone !== undefined) {
        const normalizedPhone = normalizePhoneNumber(data.phone)
        const phoneDigits = normalizedPhone.replace(/\D/g, '')
        if (phoneDigits.length < 10) {
          setResponseStatus(400)
          throw {
            message: 'Phone number must have at least 10 digits',
            status: 400,
          }
        }
        updateData.phone = normalizedPhone
      }
      if (data.address !== undefined)
        updateData.address = data.address?.trim() || null
      if (data.emergencyContact !== undefined)
        updateData.emergencyContact = data.emergencyContact?.trim() || null
      if (data.is501c3 !== undefined) updateData.is501c3 = data.is501c3
      if (data.taxDeductible !== undefined)
        updateData.taxDeductible = data.taxDeductible

      const updated = await db.users.update(profile.$id, updateData)

      return { profile: updated }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error updating user profile:', error)
      setResponseStatus(500)
      throw { message: 'Failed to update profile', status: 500 }
    }
  })

// Toggle 2FA schema
const toggle2FASchema = z.object({ enabled: z.boolean() })

// Toggle 2FA
export const toggle2FAFn = createServerFn({ method: 'POST' })
  .inputValidator(toggle2FASchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Profile not found', status: 404 }
      }

      const profile = profiles.rows[0]
      const updated = await db.users.update(profile.$id, {
        twoFactorEnabled: data.enabled,
      })

      return { profile: updated }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error toggling 2FA:', error)
      setResponseStatus(500)
      throw { message: 'Failed to update 2FA settings', status: 500 }
    }
  })

// Lock account (emergency)
export const lockAccountFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Profile not found', status: 404 }
      }

      const profile = profiles.rows[0]
      const updated = await db.users.update(profile.$id, {
        accountLocked: true,
      })

      // TODO: Send notification emails to all trip followers
      // TODO: Lock all trips created by this user

      return { profile: updated, message: 'Account locked successfully' }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error locking account:', error)
      setResponseStatus(500)
      throw { message: 'Failed to lock account', status: 500 }
    }
  },
)

// Unlock account schema
const unlockAccountSchema = z.object({
  unlockKey: z.string().min(255).max(255),
})

// Unlock account
export const unlockAccountFn = createServerFn({ method: 'POST' })
  .inputValidator(unlockAccountSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Profile not found', status: 404 }
      }

      const profile = profiles.rows[0]

      // Verify unlock key
      if (profile.unlockKey !== data.unlockKey) {
        setResponseStatus(403)
        throw { message: 'Invalid unlock key', status: 403 }
      }

      // Generate new unlock key for security
      const newUnlockKey = generateUnlockKey()

      // Unlock account and rotate the unlock key
      const updated = await db.users.update(profile.$id, {
        accountLocked: false,
        unlockKey: newUnlockKey,
      })

      // Create notification about the new unlock key
      try {
        await db.notifications.create(
          {
            createdBy: currentUser.$id,
            userId: currentUser.$id,
            type: 'security',
            title: 'Unlock Key Rotated',
            message:
              'Your account unlock key has been re-generated for security. Please copy the new unlock key from your Security settings and store it in a safe place.',
            linkUrl: '/settings?tab=security',
            isRead: false,
            relatedId: null,
            isVisible: true,
          },
          {
            permissions: [
              Permission.read(Role.user(currentUser.$id)),
              Permission.update(Role.user(currentUser.$id)),
              Permission.delete(Role.user(currentUser.$id)),
            ],
          },
        )
      } catch (notificationError) {
        // Log but don't fail the unlock if notification creation fails
        console.error(
          'Failed to create unlock key notification:',
          notificationError,
        )
      }

      return { profile: updated, message: 'Account unlocked successfully' }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error unlocking account:', error)
      setResponseStatus(500)
      throw { message: 'Failed to unlock account', status: 500 }
    }
  })

// Get unlock key (only for authenticated user viewing their own key)
export const getUnlockKeyFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length === 0) {
        setResponseStatus(404)
        throw { message: 'Profile not found', status: 404 }
      }

      return { unlockKey: profiles.rows[0].unlockKey }
    } catch (error) {
      if ((error as { status?: number }).status) throw error
      console.error('Error fetching unlock key:', error)
      setResponseStatus(500)
      throw { message: 'Failed to fetch unlock key', status: 500 }
    }
  },
)
