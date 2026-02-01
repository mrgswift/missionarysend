// App Configuration
export const APP_NAME = 'Missionary Send App'
export const APP_DESCRIPTION =
  'A comprehensive platform empowering missionaries and organizations to organize mission trips, raise funds, and engage supporters through donations and real-time updates.'

// Navigation Items
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { title: 'My Trips', href: '/trips', icon: 'Map' },
  { title: 'Following', href: '/following', icon: 'Users' },
  { title: 'Donations', href: '/donations', icon: 'Heart' },
  { title: 'Journal', href: '/journal', icon: 'BookOpen' },
  { title: 'Prayer', href: '/prayer', icon: 'HandHeart' },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: 'Settings' },
  { title: 'Help', href: '/help', icon: 'HelpCircle' },
]

// Account Types
export const ACCOUNT_TYPES = {
  missionary: {
    label: 'Individual Missionary',
    description: 'For individual missionaries organizing their own trips',
    maxMembers: 1,
  },
  organization: {
    label: 'Organization / Church',
    description: 'For churches, ministries, or mission organizations',
    maxMembers: 4, // 1 owner + 3 additional members
  },
} as const

// Reaction Types
export const REACTION_TYPES = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  pray: { emoji: '🙏', label: 'Praying' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  comment_reply: { icon: 'MessageCircle', color: 'text-blue-500' },
  donation: { icon: 'Heart', color: 'text-emerald-500' },
  trip_update: { icon: 'Bell', color: 'text-amber-500' },
  prayer_request: { icon: 'HandHeart', color: 'text-purple-500' },
  account_locked: { icon: 'Lock', color: 'text-rose-500' },
  general: { icon: 'Info', color: 'text-slate-500' },
} as const

// Stripe Configuration (placeholders for future integration)
export const STRIPE_CONFIG = {
  publishableKey: '', // Will be set via env var
  tripActivationFee: 10.0,
  percentageFee: 0.029,
  fixedFee: 0.3,
} as const

// Validation Constants
export const VALIDATION = {
  password: {
    minLength: 8,
    maxLength: 128,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
  phone: {
    pattern: /^[\d\s\-+()]+$/,
  },
  unlockKey: {
    length: 255,
  },
} as const

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const
