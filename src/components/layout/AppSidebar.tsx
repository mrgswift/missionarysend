import { Link, useRouterState } from '@tanstack/react-router'
import {
  Home,
  Plane,
  DollarSign,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AccountType } from '@/types'

interface AppSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  accountType: AccountType
}

export function AppSidebar({
  isCollapsed,
  onToggle,
  accountType,
}: AppSidebarProps) {
  const router = useRouterState()
  const currentPath = router.location.pathname

  // Navigation items based on account type
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: <Home className="h-5 w-5" />,
      },
    ]

    if (accountType === 'missionary' || accountType === 'organization') {
      return [
        ...baseItems,
        {
          title: 'My Trips',
          href: '/trips',
          icon: <Plane className="h-5 w-5" />,
        },
        {
          title: 'Donations',
          href: '/donations',
          icon: <DollarSign className="h-5 w-5" />,
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ]
    }

    if (accountType === 'follower' || accountType === 'intercessor') {
      return [
        ...baseItems,
        {
          title: 'Prayer',
          href: '/prayer',
          icon: <Heart className="h-5 w-5" />,
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: <Settings className="h-5 w-5" />,
        },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-200 ease-in-out z-40',
        isCollapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-slate-900">
                MissionHub
              </span>
            </Link>
          )}
          {isCollapsed && (
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-full"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-slate-100',
                  isActive && 'bg-slate-900 text-white hover:bg-slate-800',
                  !isActive && 'text-slate-700',
                  isCollapsed && 'justify-center',
                )}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button - Hidden on mobile */}
        <div className="p-3 border-t border-slate-200 hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center',
              !isCollapsed && 'justify-between',
            )}
          >
            {!isCollapsed && (
              <span className="text-sm text-slate-600">Collapse</span>
            )}
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
