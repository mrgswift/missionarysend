import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, User } from 'lucide-react'
import {
  createUserProfileFn,
  updateUserProfileFn,
} from '@/server/functions/users'
import type { Users } from '@/server/lib/appwrite.types'
import { useAuth } from '@/hooks/use-auth'
import { formatPhoneForDisplay } from '@/lib/phone-utils'

const profileSchema = z.object({
  accountType: z.enum(['missionary', 'organization']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileSectionProps {
  profile: Users | null
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const createProfile = useServerFn(createUserProfileFn)
  const updateProfile = useServerFn(updateUserProfileFn)

  const isNewProfile = !profile

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      accountType:
        (profile?.accountType as 'missionary' | 'organization') || 'missionary',
      name: profile?.name || currentUser?.name || '',
      email: profile?.email || currentUser?.email || '',
      phone: profile?.phone
        ? formatPhoneForDisplay(profile.phone)
        : currentUser?.phone
          ? formatPhoneForDisplay(currentUser.phone)
          : '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await createProfile({
        data: {
          ...data,
          address: data.address || null,
          emergencyContact: data.emergencyContact || null,
          is501c3: false,
          taxDeductible: false,
        },
      })
    },
    onSuccess: () => {
      toast.success('Profile created successfully')
      void router.invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create profile')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await updateProfile({
        data: {
          name: data.name,
          phone: data.phone,
          address: data.address || null,
          emergencyContact: data.emergencyContact || null,
        },
      })
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
      void router.invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    if (isNewProfile) {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <User className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Profile Information</h3>
          <p className="text-sm text-slate-500">
            {isNewProfile
              ? 'Set up your profile to get started'
              : 'Update your personal information'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Type - Only editable for new profiles */}
        {isNewProfile && (
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              value={form.watch('accountType')}
              onValueChange={(value: 'missionary' | 'organization') =>
                form.setValue('accountType', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missionary">
                  <div className="flex flex-col items-start">
                    <span>Individual Missionary</span>
                    <span className="text-xs text-slate-500">
                      For individual missionaries organizing their own trips
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="organization">
                  <div className="flex flex-col items-start">
                    <span>Organization / Church</span>
                    <span className="text-xs text-slate-500">
                      For churches, ministries, or mission organizations
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.accountType && (
              <p className="text-sm text-rose-500">
                {form.formState.errors.accountType.message}
              </p>
            )}
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name{' '}
            {profile?.accountType === 'organization' && '/ Organization Name'}
          </Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Enter your full name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-rose-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Email - Read only after profile creation */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="Enter your email"
            disabled={!isNewProfile}
            className={!isNewProfile ? 'bg-slate-50' : ''}
          />
          {!isNewProfile && (
            <p className="text-xs text-slate-500">
              Email cannot be changed after account creation
            </p>
          )}
          {form.formState.errors.email && (
            <p className="text-sm text-rose-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...form.register('phone')}
            placeholder="(555) 555-1212 or +1-555-555-1212"
          />
          <p className="text-xs text-slate-500">
            Enter in any format - we'll format it automatically
          </p>
          {form.formState.errors.phone && (
            <p className="text-sm text-rose-500">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...form.register('address')}
            placeholder="Enter your address"
            rows={3}
          />
          {form.formState.errors.address && (
            <p className="text-sm text-rose-500">
              {form.formState.errors.address.message}
            </p>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Textarea
            id="emergencyContact"
            {...form.register('emergencyContact')}
            placeholder="Name, relationship, and phone number"
            rows={2}
          />
          <p className="text-xs text-slate-500">
            Include name, relationship, and contact information
          </p>
          {form.formState.errors.emergencyContact && (
            <p className="text-sm text-rose-500">
              {form.formState.errors.emergencyContact.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNewProfile ? 'Create Profile' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
