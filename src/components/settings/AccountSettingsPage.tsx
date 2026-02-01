import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageContainer, PageHeader } from '@/components/layout'
import { ProfileSection } from './ProfileSection'
import { SecuritySection } from './SecuritySection'
import { OrganizationSection } from './OrganizationSection'
import { StripeSection } from './StripeSection'
import { EmergencySection } from './EmergencySection'
import { VerificationSection } from './VerificationSection'
import {
  User,
  Shield,
  Building2,
  CreditCard,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react'
import type { Users } from '@/server/lib/appwrite.types'

interface AccountSettingsPageProps {
  profile: Users | null
  accountType?: 'missionary' | 'organization'
}

export function AccountSettingsPage({
  profile,
  accountType = 'missionary',
}: AccountSettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'verification', label: 'Verification', icon: BadgeCheck },
    { id: 'security', label: 'Security', icon: Shield },
    ...(accountType === 'organization'
      ? [{ id: 'organization', label: 'Organization', icon: Building2 }]
      : []),
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Account Settings"
        description="Manage your account preferences and security settings"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
            <TabsList className="h-auto p-0 bg-transparent rounded-none w-max min-w-full justify-start">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-none text-slate-600 data-[state=active]:text-slate-900 transition-all whitespace-nowrap text-xs md:text-sm"
                  >
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden xs:inline sm:inline">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            <TabsContent value="profile" className="m-0">
              <ProfileSection profile={profile} />
            </TabsContent>

            <TabsContent value="verification" className="m-0">
              <VerificationSection />
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <SecuritySection profile={profile} />
            </TabsContent>

            {accountType === 'organization' && (
              <TabsContent value="organization" className="m-0">
                <OrganizationSection profile={profile} />
              </TabsContent>
            )}

            <TabsContent value="payments" className="m-0">
              <StripeSection profile={profile} />
            </TabsContent>

            <TabsContent value="emergency" className="m-0">
              <EmergencySection profile={profile} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageContainer>
  )
}
