import { redirect, Outlet } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { getUserProfileFn } from '@/server/functions/users'
import { getVerificationStatusFn } from '@/server/functions/verification'
import { AppLayout } from '@/components/layout'
import type { AccountType } from '@/types'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ location }) => {
    const { currentUser } = await authMiddleware()

    if (!currentUser) {
      if (
        location.pathname !== '/sign-in' &&
        location.pathname !== '/sign-up'
      ) {
        throw redirect({ to: '/sign-in', search: { redirect: location.href } })
      }
    }

    // Check email verification status
    const verificationStatus = await getVerificationStatusFn()

    if (currentUser && !verificationStatus.emailVerified) {
      // Redirect unverified users to verification pending page
      throw redirect({ to: '/verification-pending' })
    }

    // Fetch user profile
    const profile = await getUserProfileFn()

    // Check if account is locked
    if (profile && profile.accountLocked) {
      // Redirect to account locked page
      throw redirect({ to: '/account-locked' })
    }

    return {
      currentUser,
      profile,
      verificationStatus,
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const { profile } = Route.useRouteContext()

  // Determine account type with proper typing
  const accountType: AccountType =
    (profile?.accountType as AccountType) || 'missionary'

  return (
    <AppLayout accountType={accountType}>
      <Outlet />
    </AppLayout>
  )
}
