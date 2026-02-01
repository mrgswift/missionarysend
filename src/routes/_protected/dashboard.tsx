import { createFileRoute } from '@tanstack/react-router'
import { PageContainer, PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { profile } = Route.useRouteContext()

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${profile?.name || 'Missionary'}!`}
        description="Manage your mission trips and track your fundraising progress"
      />

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Trips</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">
            No active trips yet
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Raised</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">$0</div>
          <p className="text-xs text-muted-foreground mt-1">
            Start your first trip
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Followers</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">
            Build your support team
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Donations</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-1">No donations yet</p>
        </Card>
      </div>

      {/* Empty State - Create First Trip */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Create Your First Trip</h3>
          <p className="text-muted-foreground mb-6">
            Start your mission trip fundraising journey. Set up your trip page,
            share your story, and begin accepting donations.
          </p>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Trip
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            {profile?.accountType === 'organization'
              ? 'Unlimited trips included in your plan'
              : 'Pay $10 when you activate fundraising'}
          </p>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="font-semibold mb-2">Complete Your Profile</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add more details to help donors connect with your mission
          </p>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              Go to Settings
            </Button>
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="font-semibold mb-2">Connect Stripe</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Set up payment processing to accept donations
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h4 className="font-semibold mb-2">Invite Team Members</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {profile?.accountType === 'organization'
              ? 'Add team members to manage trips together'
              : 'Invite prayer partners and supporters'}
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </Card>
      </div>
    </PageContainer>
  )
}
