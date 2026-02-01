import { getCurrentUser } from '@/server/functions/auth'
import { getVerificationStatusFn } from '@/server/functions/verification'
import { getUserProfileFn } from '@/server/functions/users'
import { redirect } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  loader: async ({ location }) => {
    const currentUser = await getCurrentUser()

    // Allow sign-out for everyone
    if (location.pathname === '/sign-out') {
      return { currentUser }
    }

    // Allow account-locked page for authenticated users with locked accounts
    if (location.pathname === '/account-locked') {
      if (!currentUser) {
        throw redirect({ to: '/sign-in' })
      }
      return { currentUser }
    }

    // Allow verification-pending and verify-email pages for logged-in unverified users
    const isVerificationPage =
      location.pathname === '/verification-pending' ||
      location.pathname === '/verify-email'

    if (currentUser) {
      // Check verification status
      const verificationStatus = await getVerificationStatusFn()

      // If user is verified, check if account is locked
      if (verificationStatus.emailVerified) {
        const profile = await getUserProfileFn()

        // If account is locked, redirect to account-locked page
        if (profile && profile.accountLocked) {
          throw redirect({ to: '/account-locked' })
        }

        // Otherwise redirect to dashboard
        throw redirect({ to: '/dashboard' })
      }

      // If user is not verified, allow verification pages
      if (isVerificationPage) {
        return { currentUser, verificationStatus }
      }

      // Redirect unverified users to verification-pending
      throw redirect({ to: '/verification-pending' })
    }

    // For non-logged-in users, allow all auth pages except verification-pending and account-locked
    if (
      (isVerificationPage || location.pathname === '/account-locked') &&
      !currentUser
    ) {
      throw redirect({ to: '/sign-in' })
    }

    return {
      currentUser,
    }
  },
})
