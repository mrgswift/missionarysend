import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Building,
  DollarSign,
  Info,
} from 'lucide-react'
import type { Users } from '@/server/lib/appwrite.types'
import { STRIPE_CONFIG } from '@/lib/constants'

interface StripeSectionProps {
  profile: Users | null
}

export function StripeSection({ profile }: StripeSectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const isConnected = !!profile?.stripeAccountId

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    // TODO: Implement Stripe Connect OAuth flow
    // This will redirect to Stripe's onboarding flow
    setTimeout(() => {
      setIsConnecting(false)
      // toast.info('Stripe integration coming soon')
    }, 1000)
  }

  const handleManageStripe = () => {
    // TODO: Open Stripe dashboard or express dashboard
    window.open('https://dashboard.stripe.com', '_blank')
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 mb-2">
          Complete Your Profile First
        </h3>
        <p className="text-sm text-slate-500">
          Please complete your profile information before setting up payments.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Payment Settings</h3>
          <p className="text-sm text-slate-500">
            Connect your bank account to receive donations
          </p>
        </div>
      </div>

      {/* Stripe Connection Status */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Stripe Account</h4>

        <div
          className={`rounded-lg border-2 p-6 ${isConnected ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-100' : 'bg-slate-200'}`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <Building className="h-6 w-6 text-slate-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-slate-900">
                    {isConnected ? 'Stripe Connected' : 'Connect Stripe'}
                  </h5>
                  <Badge
                    variant={isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {isConnected ? 'Active' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {isConnected
                    ? 'Your Stripe account is connected and ready to receive donations.'
                    : 'Connect your Stripe account to receive donations from your supporters.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50">
            {isConnected ? (
              <Button variant="outline" onClick={handleManageStripe}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Stripe Account
              </Button>
            ) : (
              <Button onClick={handleConnectStripe} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect with Stripe'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fee Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Fee Information</h4>

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Processing Fees:</strong> Stripe charges{' '}
            {(STRIPE_CONFIG.percentageFee * 100).toFixed(1)}% + $
            {STRIPE_CONFIG.fixedFee.toFixed(2)} per transaction. Donors have the
            option to cover these fees when making a donation.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Trip Activation Fee
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              ${STRIPE_CONFIG.tripActivationFee.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">One-time fee per trip</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Processing Fee
              </span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {(STRIPE_CONFIG.percentageFee * 100).toFixed(1)}% + $
              {STRIPE_CONFIG.fixedFee.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Per donation (can be covered by donor)
            </p>
          </div>
        </div>
      </div>

      {/* Payout Information */}
      {isConnected && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Payout Schedule</h4>

          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              Donations are automatically transferred to your connected bank
              account on a rolling basis. Standard payouts arrive in 2-3
              business days.
            </p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-sm"
              onClick={handleManageStripe}
            >
              View payout settings in Stripe
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
