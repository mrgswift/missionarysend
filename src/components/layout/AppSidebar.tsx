import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Map,
  Users,
  Heart,
  BookOpen,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HandHeart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import type { AccountType } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface AppSidebarProps {
  profile?: {
    name: string
    email: string
  } | null
  isCollapsed: boolean
  onToggle: () => void
  accountType?: AccountType
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation()
  const { signOut } = useAuth()

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { title: 'My Trips', href: '/trips', icon: <Map className="h-5 w-5" /> },
    {
      title: 'Following',
      href: '/following',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Donations',
      href: '/donations',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      title: 'Journal',
      href: '/journal',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: 'Prayer',
      href: '/prayer',
      icon: <HandHeart className="h-5 w-5" />,
    },
  ]

  const bottomNavItems: NavItem[] = [
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    { title: 'Help', href: '/help', icon: <HelpCircle className="h-5 w-5" /> },
  ]

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    )
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href)

    const linkContent = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-slate-100',
          active && 'bg-slate-900 text-white hover:bg-slate-800',
          !active && 'text-slate-600',
          isCollapsed && 'justify-center px-2',
        )}
      >
        <span className={cn(active && 'text-white')}>{item.icon}</span>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-medium text-sm whitespace-nowrap overflow-hidden"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    )

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40"
      >
        {/* Logo Area */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-slate-200 px-4',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="font-semibold text-slate-900 whitespace-nowrap">
                    Missionary Send
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {/* Sign Out Button */}
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 w-full"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100',
              !isCollapsed && 'justify-between',
            )}
          >
            {!isCollapsed && <span className="text-xs">Collapse</span>}
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
