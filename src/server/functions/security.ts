import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { setResponseStatus } from '@tanstack/react-start/server'
import { authMiddleware, getAppwriteSessionFn } from './auth'
import { createSessionClient } from '../lib/appwrite'
import { AppwriteException, AuthenticatorType } from 'node-appwrite'
import { db } from '../lib/db'
import { Query } from 'node-appwrite'
import QRCode from 'qrcode'

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

// Change password
export const changePasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(changePasswordSchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    if (data.newPassword !== data.confirmPassword) {
      setResponseStatus(400)
      throw { message: 'Passwords do not match', status: 400 }
    }

    try {
      const session = await getAppwriteSessionFn()
      if (!session) {
        setResponseStatus(401)
        throw { message: 'No active session', status: 401 }
      }

      const client = await createSessionClient(session)

      // Update password (Appwrite will verify current password)
      await client.account.updatePassword({
        password: data.newPassword,
        oldPassword: data.currentPassword,
      })

      return {
        success: true,
        message: 'Password changed successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      console.error('Error changing password:', error)

      if (error.code === 401) {
        setResponseStatus(401)
        throw { message: 'Current password is incorrect', status: 401 }
      }

      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to change password',
        status: error.code || 500,
      }
    }
  })

// Setup 2FA - Generate secret and QR code
export const setup2FAFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const session = await getAppwriteSessionFn()
      if (!session) {
        setResponseStatus(401)
        throw { message: 'No active session', status: 401 }
      }

      const client = await createSessionClient(session)

      // Create MFA authenticator
      const mfa = await client.account.createMfaAuthenticator(
        AuthenticatorType.Totp,
      )

      // Generate QR code from the URI
      const qrCodeDataUrl = await QRCode.toDataURL(mfa.uri)

      return {
        secret: mfa.secret,
        qrCode: qrCodeDataUrl,
        uri: mfa.uri,
      }
    } catch (_error) {
      const error = _error as AppwriteException
      console.error('Error setting up 2FA:', error)
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to setup 2FA',
        status: error.code || 500,
      }
    }
  },
)

// Verify 2FA code and enable
const verify2FASchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

export const verify2FAFn = createServerFn({ method: 'POST' })
  .inputValidator(verify2FASchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const session = await getAppwriteSessionFn()
      if (!session) {
        setResponseStatus(401)
        throw { message: 'No active session', status: 401 }
      }

      const client = await createSessionClient(session)

      // Verify the MFA code
      await client.account.updateMfaAuthenticator({
        type: AuthenticatorType.Totp,
        otp: data.code,
      })

      // Update user profile to mark 2FA as enabled
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length > 0) {
        await db.users.update(profiles.rows[0].$id, {
          twoFactorEnabled: true,
        })
      }

      return {
        success: true,
        message: '2FA enabled successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      console.error('Error verifying 2FA:', error)

      if (error.code === 401) {
        setResponseStatus(401)
        throw { message: 'Invalid verification code', status: 401 }
      }

      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to verify 2FA code',
        status: error.code || 500,
      }
    }
  })

// Disable 2FA
const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

export const disable2FAFn = createServerFn({ method: 'POST' })
  .inputValidator(disable2FASchema)
  .handler(async ({ data }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      setResponseStatus(401)
      throw { message: 'Unauthorized', status: 401 }
    }

    try {
      const session = await getAppwriteSessionFn()
      if (!session) {
        setResponseStatus(401)
        throw { message: 'No active session', status: 401 }
      }

      const client = await createSessionClient(session)

      // Verify password first by attempting to update it with the same password
      try {
        await client.account.updatePassword({
          password: data.password,
          oldPassword: data.password,
        })
      } catch {
        setResponseStatus(401)
        throw { message: 'Incorrect password', status: 401 }
      }

      // Delete MFA authenticator
      await client.account.deleteMfaAuthenticator(AuthenticatorType.Totp)

      // Update user profile to mark 2FA as disabled
      const profiles = await db.users.list([
        Query.equal('createdBy', [currentUser.$id]),
        Query.limit(1),
      ])

      if (profiles.rows.length > 0) {
        await db.users.update(profiles.rows[0].$id, {
          twoFactorEnabled: false,
        })
      }

      return {
        success: true,
        message: '2FA disabled successfully',
      }
    } catch (_error) {
      const error = _error as AppwriteException
      console.error('Error disabling 2FA:', error)

      if ((error as { status?: number }).status === 401) {
        throw error
      }

      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Failed to disable 2FA',
        status: error.code || 500,
      }
    }
  })
