import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { AccountSettingsPage } from '@/components/settings'

const protectedRoute = getRouteApi('/_protected')

export const Route = createFileRoute('/_protected/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { profile } = protectedRoute.useLoaderData()

  return (
    <AccountSettingsPage
      profile={profile}
      accountType={
        profile?.accountType as 'missionary' | 'organization' | undefined
      }
    />
  )
}
