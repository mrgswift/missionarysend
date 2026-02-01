import { redirect, Outlet } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/server/functions/auth'
import { getUserProfileFn } from '@/server/functions/users'
import { getVerificationStatusFn } from '@/server/functions/verification'
import { AppLayout } from '@/components/layout'

export const Route = createFileRoute('/_protected')({
  loader: async ({ location }) => {
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
  const { profile } = Route.useLoaderData()

  return (
    <AppLayout
      accountType={
        profile?.accountType as 'missionary' | 'organization' | undefined
      }
    >
      <Outlet />
    </AppLayout>
  )
}
