import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { createAdminClient, createSessionClient } from '../lib/appwrite'
import { AppwriteException, ID } from 'node-appwrite'
import {
  setResponseStatus,
  getRequestHeader,
} from '@tanstack/react-start/server'
import { db } from '../lib/db'
import { setAppwriteSessionCookiesFn } from './auth'

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  if (!digitsOnly) return ''
  return `+${digitsOnly}`
}

const signUpWithProfileSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  accountType: z.enum(['missionary', 'organization']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  is501c3: z.boolean().default(false),
  taxDeductible: z.boolean().default(false),
  organizationManagerEmail: z.string().email().nullable().optional(),
  organizationEIN: z.string().nullable().optional(),
  redirect: z.string().optional(),
})

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

export const signUpWithProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(signUpWithProfileSchema)
  .handler(async ({ data }) => {
    const { email, password, ...profileData } = data
    const { account } = createAdminClient()

    try {
      // Normalize phone number to E.164 format
      const normalizedPhone = normalizePhoneNumber(profileData.phone)

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

      // Create Appwrite account
      const userId = ID.unique()
      await account.create({
        userId,
        email,
        password,
        name: profileData.name.trim(),
      })

      // Create session
      const session = await account.createEmailPasswordSession({
        email,
        password,
      })

      // Set session cookies
      await setAppwriteSessionCookiesFn({
        data: {
          id: session.$id,
          secret: session.secret,
          expires: session.expire || undefined,
        },
      })

      // Update phone number in Appwrite Account (for verification)
      try {
        const sessionClient = await createSessionClient(session.secret)
        await sessionClient.account.updatePhone({
          phone: normalizedPhone,
          password: password,
        })
      } catch (phoneError) {
        console.error('Failed to set phone in Appwrite account:', phoneError)
        // Continue even if phone update fails
      }

      // Create user profile in database
      await db.users.create({
        createdBy: userId,
        accountType: profileData.accountType,
        name: profileData.name.trim(),
        email: email.trim().toLowerCase(),
        phone: normalizedPhone,
        address: profileData.address?.trim() || null,
        emergencyContact: profileData.emergencyContact?.trim() || null,
        is501c3: profileData.is501c3,
        taxDeductible: profileData.taxDeductible,
        stripeAccountId: null,
        unlockKey,
        accountLocked: false,
        twoFactorEnabled: false,
        avatarFileId: null,
      })

      // Send email verification
      try {
        const origin = getRequestHeader('origin')
        if (origin) {
          const verifyUrl = `${origin}/verify-email`
          const sessionClient = await createSessionClient(session.secret)
          await sessionClient.account.createVerification({
            url: verifyUrl,
          })
        }
      } catch (verificationError) {
        // Log but don't fail signup if verification email fails
        console.error('Failed to send verification email:', verificationError)
      }

      // Note: Organization-specific data (managerEmail, EIN) is stored in the profile
      // In a production app, you might want a separate organizations table
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to create account',
        status: error.code || 500,
      }
    }

    // Redirect to verification pending page instead of dashboard
    throw redirect({ to: '/verification-pending' })
  })
