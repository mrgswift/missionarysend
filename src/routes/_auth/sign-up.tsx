/**
 * @imagine-readonly
 */

import { useMutation } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { z } from 'zod'
import { AuthCard } from '@/components/auth/auth-card'
import { signUpWithProfileFn } from '@/server/functions/signup'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
  validateSearch: searchSchema,
})

type AccountType = 'missionary' | 'organization'

interface FormData {
  // Step 1: Account Type
  accountType: AccountType | null

  // Step 2: Auth Credentials
  email: string
  password: string
  confirmPassword: string

  // Step 3: Personal/Organization Info
  firstName: string
  lastName: string
  organizationName: string
  phone: string
  address: string
  emergencyContact: string

  // Step 4: Organization-specific
  managerEmail: string
  ein: string
  is501c3: boolean
}

function SignUpPage() {
  const search = useSearch({ from: Route.id })
  const router = useRouter()
  const signUpWithProfile = useServerFn(signUpWithProfileFn)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    accountType: null,
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    phone: '',
    address: '',
    emergencyContact: '',
    managerEmail: '',
    ein: '',
    is501c3: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const signUpMutation = useMutation({
    mutationFn: async () => {
      // Validate final step
      const validationErrors: Record<string, string> = {}

      if (formData.accountType === 'organization') {
        if (!formData.organizationName.trim()) {
          validationErrors.organizationName = 'Organization name is required'
        }
        if (!formData.managerEmail.trim()) {
          validationErrors.managerEmail = 'Manager email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.managerEmail)) {
          validationErrors.managerEmail = 'Please enter a valid email'
        }
        if (formData.is501c3 && !formData.ein.trim()) {
          validationErrors.ein = 'EIN is required for 501(c)(3) organizations'
        }
      } else {
        if (!formData.firstName.trim()) {
          validationErrors.firstName = 'First name is required'
        }
        if (!formData.lastName.trim()) {
          validationErrors.lastName = 'Last name is required'
        }
      }

      if (!formData.phone.trim()) {
        validationErrors.phone = 'Phone number is required'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        throw new Error('Validation failed')
      }

      await signUpWithProfile({
        data: {
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType!,
          name:
            formData.accountType === 'organization'
              ? formData.organizationName
              : `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address || null,
          emergencyContact: formData.emergencyContact || null,
          is501c3: formData.is501c3,
          taxDeductible: formData.is501c3,
          organizationManagerEmail:
            formData.accountType === 'organization'
              ? formData.managerEmail
              : null,
          organizationEIN:
            formData.accountType === 'organization' && formData.is501c3
              ? formData.ein
              : null,
          redirect: search.redirect,
        },
      })
    },
    onSuccess: async () => {
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.',
      })
      await router.invalidate()
      // Don't navigate - the server will redirect to verification-pending
    },
    onError: async (error: {
      status?: number
      redirect?: boolean
      message?: string
    }) => {
      if (
        error?.status === 302 ||
        error?.redirect ||
        error?.message?.includes('redirect')
      ) {
        toast.success('Account created successfully!', {
          description: 'Please check your email to verify your account.',
        })
        await router.invalidate()
        // Don't navigate - the server will redirect to verification-pending
        return
      }
      console.error('Sign up error:', error)
      const errorMessage =
        error.message || 'Failed to create account. Please try again.'
      toast.error('Sign up failed', {
        description: errorMessage,
      })
      setErrors({ root: errorMessage })
    },
  })

  const handleNext = () => {
    const validationErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.accountType) {
        validationErrors.accountType = 'Please select an account type'
      }
    } else if (step === 2) {
      if (!formData.email.trim()) {
        validationErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        validationErrors.email = 'Please enter a valid email'
      }
      if (!formData.password) {
        validationErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        validationErrors.password = 'Password must be at least 8 characters'
      }
      if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match'
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setStep(step + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStep(step - 1)
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const totalSteps = formData.accountType === 'organization' ? 4 : 3

  return (
    <AuthCard
      title={
        step === 1
          ? 'Create Your Account'
          : step === 2
            ? 'Account Credentials'
            : step === 3
              ? formData.accountType === 'organization'
                ? 'Organization Details'
                : 'Personal Information'
              : 'Organization Information'
      }
      description={
        step === 1
          ? 'Choose your account type to get started'
          : step === 2
            ? 'Set up your login credentials'
            : step === 3
              ? formData.accountType === 'organization'
                ? 'Tell us about your organization'
                : 'Complete your profile'
              : 'Additional organization details'
      }
    >
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-medium">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Account Type Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <RadioGroup
            value={formData.accountType || ''}
            onValueChange={(value) =>
              updateFormData('accountType', value as AccountType)
            }
          >
            <Card
              className={`p-6 cursor-pointer transition-all ${
                formData.accountType === 'missionary'
                  ? 'border-blue-500 border-2 bg-blue-50'
                  : 'hover:border-slate-300'
              }`}
              onClick={() => updateFormData('accountType', 'missionary')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="missionary" id="missionary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <Label
                      htmlFor="missionary"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      Individual Missionary
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect for individual missionaries planning mission trips.
                    Pay $10 per trip when you activate fundraising.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`p-6 cursor-pointer transition-all ${
                formData.accountType === 'organization'
                  ? 'border-purple-500 border-2 bg-purple-50'
                  : 'hover:border-slate-300'
              }`}
              onClick={() => updateFormData('accountType', 'organization')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="organization" id="organization" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <Label
                      htmlFor="organization"
                      className="text-lg font-semibold cursor-pointer"
                    >
                      Mission Organization
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For churches and mission organizations managing multiple
                    trips. $65/month for unlimited trips and team members.
                  </p>
                </div>
              </div>
            </Card>
          </RadioGroup>

          {errors.accountType && (
            <p className="text-sm text-red-600">{errors.accountType}</p>
          )}

          <Button
            onClick={handleNext}
            className="w-full"
            size="lg"
            disabled={!formData.accountType}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Credentials */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData('confirmPassword', e.target.value)
              }
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1" size="lg">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Personal/Organization Info */}
      {step === 3 && (
        <div className="space-y-4">
          {formData.accountType === 'missionary' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData('firstName', e.target.value)
                    }
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                placeholder="Grace Community Church"
                value={formData.organizationName}
                onChange={(e) =>
                  updateFormData('organizationName', e.target.value)
                }
              />
              {errors.organizationName && (
                <p className="text-sm text-red-600">
                  {errors.organizationName}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State, ZIP"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
            />
          </div>

          {formData.accountType === 'missionary' && (
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">
                Emergency Contact (Optional)
              </Label>
              <Input
                id="emergencyContact"
                placeholder="Name and phone number"
                value={formData.emergencyContact}
                onChange={(e) =>
                  updateFormData('emergencyContact', e.target.value)
                }
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={
                formData.accountType === 'organization'
                  ? handleNext
                  : () => signUpMutation.mutate()
              }
              className="flex-1"
              size="lg"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : formData.accountType === 'organization' ? (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Organization-specific (only for organizations) */}
      {step === 4 && formData.accountType === 'organization' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="managerEmail">Manager Email</Label>
            <Input
              id="managerEmail"
              type="email"
              placeholder="manager@organization.org"
              value={formData.managerEmail}
              onChange={(e) => updateFormData('managerEmail', e.target.value)}
            />
            {errors.managerEmail && (
              <p className="text-sm text-red-600">{errors.managerEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">
              Emergency Contact (Optional)
            </Label>
            <Input
              id="emergencyContact"
              placeholder="Name and phone number"
              value={formData.emergencyContact}
              onChange={(e) =>
                updateFormData('emergencyContact', e.target.value)
              }
            />
          </div>

          <div className="flex items-start space-x-2 p-4 bg-slate-50 rounded-lg">
            <Checkbox
              id="is501c3"
              checked={formData.is501c3}
              onCheckedChange={(checked) =>
                updateFormData('is501c3', checked as boolean)
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="is501c3"
                className="text-sm font-medium cursor-pointer"
              >
                We are a 501(c)(3) organization
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                This enables tax-deductible donation receipts for your donors
              </p>
            </div>
          </div>

          {formData.is501c3 && (
            <div className="space-y-2">
              <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
              <Input
                id="ein"
                placeholder="12-3456789"
                value={formData.ein}
                onChange={(e) => updateFormData('ein', e.target.value)}
              />
              {errors.ein && (
                <p className="text-sm text-red-600">{errors.ein}</p>
              )}
            </div>
          )}

          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.root}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
              size="lg"
              disabled={signUpMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => signUpMutation.mutate()}
              className="flex-1"
              size="lg"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mt-6 space-x-1">
        <div className="inline-block">Already have an account? </div>
        <div className="inline-block">
          <Link
            to="/sign-in"
            search={search.redirect ? { redirect: search.redirect } : undefined}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
