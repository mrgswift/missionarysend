import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus, Trash2, Mail } from 'lucide-react'
import { updateUserProfileFn } from '@/server/functions/users'
import type { Users as UsersType } from '@/server/lib/appwrite.types'

interface OrganizationSectionProps {
  profile: UsersType | null
}

// Mock organization members - will be replaced with real data
const mockMembers = [
  { id: '1', name: 'John Smith', email: 'john@example.org', role: 'Admin' },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.org',
    role: 'Member',
  },
]

export function OrganizationSection({ profile }: OrganizationSectionProps) {
  const router = useRouter()
  const updateProfile = useServerFn(updateUserProfileFn)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  const updateMutation = useMutation({
    mutationFn: async (data: { is501c3: boolean; taxDeductible: boolean }) => {
      return await updateProfile({ data })
    },
    onSuccess: () => {
      toast.success('Organization settings updated')
      void router.invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })

  const handleAddMember = () => {
    if (!newMemberEmail) return
    // TODO: Implement add member functionality
    toast.info('Member invitation feature coming soon')
    setNewMemberEmail('')
  }

  const handleRemoveMember = () => {
    // TODO: Implement member removal
    toast.info('Member removal feature coming soon')
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 mb-2">
          Complete Your Profile First
        </h3>
        <p className="text-sm text-slate-500">
          Please complete your profile information before configuring
          organization settings.
        </p>
      </div>
    )
  }

  if (profile.accountType !== 'organization') {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 mb-2">
          Organization Account Required
        </h3>
        <p className="text-sm text-slate-500">
          This section is only available for organization accounts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">
            Organization Settings
          </h3>
          <p className="text-sm text-slate-500">
            Manage your organization details and team members
          </p>
        </div>
      </div>

      {/* Tax Status */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Tax Status</h4>

        <div className="bg-slate-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700">501(c)(3) Organization</p>
              <p className="text-xs text-slate-500 mt-1">
                Is your organization a registered 501(c)(3) non-profit?
              </p>
            </div>
            <Switch
              checked={profile.is501c3}
              onCheckedChange={(checked) =>
                updateMutation.mutate({
                  is501c3: checked,
                  taxDeductible: checked ? profile.taxDeductible : false,
                })
              }
              disabled={updateMutation.isPending}
            />
          </div>

          {profile.is501c3 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-700">
                  Tax-Deductible Donations
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Are donations to your organization tax-deductible?
                </p>
              </div>
              <Switch
                checked={profile.taxDeductible}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({
                    is501c3: profile.is501c3,
                    taxDeductible: checked,
                  })
                }
                disabled={updateMutation.isPending}
              />
            </div>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <h4 className="font-medium text-slate-900">Team Members</h4>
          </div>
          <Badge variant="secondary" className="text-xs">
            {mockMembers.length} / 4 members
          </Badge>
        </div>

        <p className="text-sm text-slate-500">
          Add up to 3 additional team members to help manage your organization
          account.
        </p>

        {/* Member List */}
        <div className="space-y-2">
          {mockMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-600">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === 'Admin' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {member.role}
                </Badge>
                {member.role !== 'Admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMember}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Member */}
        {mockMembers.length < 4 && (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddMember} disabled={!newMemberEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
