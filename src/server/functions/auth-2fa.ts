import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { createAdminClient } from '../lib/appwrite'
import { AppwriteException, AuthenticationFactor } from 'node-appwrite'
import { setAppwriteSessionCookiesFn } from './auth'
import { setResponseStatus } from '@tanstack/react-start/server'

const signIn2FASchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  mfaCode: z.string().length(6, 'MFA code must be 6 digits').optional(),
  redirect: z.string().optional(),
})

export const signIn2FAFn = createServerFn({ method: 'POST' })
  .inputValidator(signIn2FASchema)
  .handler(async ({ data }) => {
    const { email, password, mfaCode, redirect: redirectUrl } = data

    try {
      const { account } = createAdminClient()

      // First, try to create a regular session
      try {
        const session = await account.createEmailPasswordSession({
          email,
          password,
        })

        await setAppwriteSessionCookiesFn({
          data: {
            id: session.$id,
            secret: session.secret,
            expires: session.expire || undefined,
          },
        })

        // If successful and no 2FA required, redirect
        if (redirectUrl) {
          throw redirect({ to: redirectUrl })
        } else {
          throw redirect({ to: '/dashboard' })
        }
      } catch (sessionError) {
        const error = sessionError as AppwriteException

        // Check if 2FA is required (error code 401 with specific message)
        if (
          error.code === 401 &&
          error.message?.includes('user_more_factors_required')
        ) {
          // If we have an MFA code, try to verify it
          if (mfaCode) {
            try {
              // Create MFA challenge
              const challenge = await account.createMfaChallenge({
                factor: AuthenticationFactor.Totp,
              })

              // Complete the challenge with the provided code
              await account.updateMfaChallenge({
                challengeId: challenge.$id,
                otp: mfaCode,
              })

              // Now create the session
              const session = await account.createEmailPasswordSession({
                email,
                password,
              })

              await setAppwriteSessionCookiesFn({
                data: {
                  id: session.$id,
                  secret: session.secret,
                  expires: session.expire || undefined,
                },
              })

              if (redirectUrl) {
                throw redirect({ to: redirectUrl })
              } else {
                throw redirect({ to: '/dashboard' })
              }
            } catch {
              setResponseStatus(401)
              throw {
                message: 'Invalid MFA code',
                status: 401,
              }
            }
          } else {
            // Return a special response indicating 2FA is required
            setResponseStatus(401)
            throw {
              message: 'Two-factor authentication required',
              status: 401,
              requires2FA: true,
            }
          }
        }

        // If it's a different error, throw it
        throw error
      }
    } catch (_error) {
      const error = _error as AppwriteException & { requires2FA?: boolean }
      setResponseStatus(error.code || 500)
      throw {
        message: error.message || 'Authentication failed',
        status: error.code || 500,
        requires2FA: error.requires2FA,
      }
    }
  })
