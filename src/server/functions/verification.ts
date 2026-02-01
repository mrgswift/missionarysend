import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSessionClient } from '../lib/appwrite'
import { AppwriteException, Client, Account } from 'node-appwrite'
import {
  setResponseStatus,
  getRequestHeader,
} from '@tanstack/react-start/server'
import { getAppwriteSessionFn } from './auth'

// Normalize phone number to E.164 format
function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  if (!digitsOnly) return ''
  return `+${digitsOnly}`
}

const verifyEmailSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret is required'),
})

export const verifyEmailFn = createServerFn({ method: 'POST' })
  .inputValidator(verifyEmailSchema)
  .handler(async ({ data }) => {
    const { userId, secret } = data

    try {
      // Create a public client (no API key, no session) for email verification
      const endpoint = process.env.APPWRITE_ENDPOINT
      const projectId = process.env.APPWRITE_PROJECT_ID

      if (!endpoint || !projectId) {
        throw new Error('Missing Appwrite configuration')
      }

      const client = new Client().setEndpoint(endpoint).setProject(projectId)

      const account = new Account(client)

      await account.updateVerification({
        userId,
        secret,
      })

      return {
        success: true,
        message: 'Email verified successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code)
      throw {
        message: error.message || 'Failed to verify email',
        status: error.code,
      }
    }
  })

// Send email verification - requires active session
export const sendEmailVerificationFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const session = await getAppwriteSessionFn()

  if (!session) {
    setResponseStatus(401)
    throw {
      message: 'You must be signed in to request email verification',
      status: 401,
    }
  }

  try {
    const client = await createSessionClient(session)

    // Get the base URL from the origin header
    const origin = getRequestHeader('origin')
    if (!origin) {
      throw new Error('Missing origin header')
    }
    const verifyUrl = `${origin}/verify-email`

    await client.account.createVerification({
      url: verifyUrl,
    })

    return {
      success: true,
      message: 'Verification email sent successfully',
    }
  } catch (_error) {
    const error = _error as AppwriteException
    setResponseStatus(error.code || 500)
    throw {
      message: error.message || 'Failed to send verification email',
      status: error.code || 500,
    }
  }
})

// Send phone verification code - requires active session with phone number
export const sendPhoneVerificationFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  const session = await getAppwriteSessionFn()

  if (!session) {
    setResponseStatus(401)
    throw {
      message: 'You must be signed in to request phone verification',
      status: 401,
    }
  }

  try {
    const client = await createSessionClient(session)

    // Check if user has a phone number set
    const user = await client.account.get()
    if (!user.phone) {
      setResponseStatus(400)
      throw {
        message:
          'No phone number associated with this account. Please add a phone number first.',
        status: 400,
      }
    }

    await client.account.createPhoneVerification()

    return {
      success: true,
      message: 'Verification code sent to your phone',
    }
  } catch (_error) {
    const error = _error as AppwriteException
    setResponseStatus(error.code || 500)
    throw {
      message: error.message || 'Failed to send phone verification code',
      status: error.code || 500,
    }
  }
})

// Verify phone with code
const verifyPhoneSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Verification code is required'),
})

export const verifyPhoneFn = createServerFn({ method: 'POST' })
  .inputValidator(verifyPhoneSchema)
  .handler(async ({ data }) => {
    const { userId, secret } = data

    const session = await getAppwriteSessionFn()

    if (!session) {
      setResponseStatus(401)
      throw {
        message: 'You must be signed in to verify your phone',
        status: 401,
      }
    }

    try {
      const client = await createSessionClient(session)

      await client.account.updatePhoneVerification({
        userId,
        secret,
      })

      return {
        success: true,
        message: 'Phone number verified successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to verify phone number',
        status: error.code || 500,
      }
    }
  })

// Get current user's verification status
export const getVerificationStatusFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await getAppwriteSessionFn()

  if (!session) {
    return {
      isAuthenticated: false,
      emailVerified: false,
      phoneVerified: false,
      hasPhone: false,
    }
  }

  try {
    const client = await createSessionClient(session)
    const user = await client.account.get()

    return {
      isAuthenticated: true,
      emailVerified: user.emailVerification,
      phoneVerified: user.phoneVerification,
      hasPhone: !!user.phone,
      email: user.email,
      phone: user.phone || null,
    }
  } catch {
    return {
      isAuthenticated: false,
      emailVerified: false,
      phoneVerified: false,
      hasPhone: false,
    }
  }
})

// Update user's phone number
const updatePhoneSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required to update phone'),
})

export const updatePhoneFn = createServerFn({ method: 'POST' })
  .inputValidator(updatePhoneSchema)
  .handler(async ({ data }) => {
    const { phone, password } = data

    const session = await getAppwriteSessionFn()

    if (!session) {
      setResponseStatus(401)
      throw {
        message: 'You must be signed in to update your phone number',
        status: 401,
      }
    }

    try {
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phone)

      // Validate phone has enough digits
      const phoneDigits = normalizedPhone.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        setResponseStatus(400)
        throw {
          message: 'Phone number must have at least 10 digits',
          status: 400,
        }
      }

      const client = await createSessionClient(session)

      await client.account.updatePhone({
        phone: normalizedPhone,
        password,
      })

      return {
        success: true,
        message: 'Phone number updated successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to update phone number',
        status: error.code || 500,
      }
    }
  })
