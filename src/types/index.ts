// Account Types
export type AccountType =
  | 'missionary'
  | 'organization'
  | 'follower'
  | 'intercessor'

// User Profile (extends Appwrite Users table)
export interface UserProfile {
  $id: string
  createdBy: string
  accountType: AccountType
  name: string
  email: string
  phone: string
  address: string | null
  emergencyContact: string | null
  is501c3: boolean
  taxDeductible: boolean
  stripeAccountId: string | null
  unlockKey: string
  accountLocked: boolean
  twoFactorEnabled: boolean
  $createdAt: string
  $updatedAt: string
}

// Organization Member
export interface OrganizationMember {
  $id: string
  createdBy: string
  organizationId: string
  memberUserId: string
  memberEmail: string
  memberName: string
  $createdAt: string
  $updatedAt: string
}

// Trip
export interface Trip {
  $id: string
  createdBy: string
  title: string
  description: string | null
  location: string
  startDate: number
  endDate: number
  fundraisingGoal: number
  fundraisingProgress: number
  isRestrictedCountry: boolean
  isActivated: boolean
  paymentReceived: boolean
  stripePaymentId: string | null
  isStarted: boolean
  fileIds: string[] | null
  $createdAt: string
  $updatedAt: string
}

// Trip Missionary (for organization trips with multiple missionaries)
export interface TripMissionary {
  $id: string
  createdBy: string
  tripId: string
  missionaryUserId: string
  missionaryName: string
  fundraisingGoal: number
  fundraisingProgress: number
  $createdAt: string
  $updatedAt: string
}

// Trip Follower
export interface TripFollower {
  $id: string
  createdBy: string
  tripId: string
  followerUserId: string
  followerName: string
  followerEmail: string
  followerPhone: string | null
  inviteToken: string | null
  $createdAt: string
  $updatedAt: string
}

// Donation
export interface Donation {
  $id: string
  createdBy: string
  tripId: string
  donorUserId: string
  donorName: string
  donorEmail: string
  amount: number
  coverProcessingFee: boolean
  processingFeeAmount: number
  stripePaymentId: string | null
  receiptSent: boolean
  missionaryId: string | null // For org trips - which missionary the donation is for
  $createdAt: string
  $updatedAt: string
}

// Trip Update
export interface TripUpdate {
  $id: string
  createdBy: string
  tripId: string
  title: string
  content: string
  notificationSent: boolean
  $createdAt: string
  $updatedAt: string
}

// Comment (for trip updates, prayer requests, etc.)
export interface Comment {
  $id: string
  createdBy: string
  parentType: 'trip' | 'tripUpdate' | 'prayerRequest'
  parentId: string
  content: string
  authorName: string
  parentCommentId: string | null // For replies
  $createdAt: string
  $updatedAt: string
}

// Reaction
export interface Reaction {
  $id: string
  createdBy: string
  commentId: string
  reactionType: 'like' | 'love' | 'pray' | 'celebrate'
  userId: string
  $createdAt: string
  $updatedAt: string
}

// Journal Entry
export interface JournalEntry {
  $id: string
  createdBy: string
  tripId: string
  title: string
  content: string
  isPrivate: boolean
  $createdAt: string
  $updatedAt: string
}

// Prayer Intercessor
export interface PrayerIntercessor {
  $id: string
  createdBy: string
  tripId: string
  intercessorUserId: string
  intercessorName: string
  intercessorEmail: string
  $createdAt: string
  $updatedAt: string
}

// Prayer Request
export interface PrayerRequest {
  $id: string
  createdBy: string
  tripId: string
  title: string
  content: string
  notificationSent: boolean
  $createdAt: string
  $updatedAt: string
}

// Notification
export interface Notification {
  $id: string
  createdBy: string
  userId: string
  type:
    | 'comment_reply'
    | 'donation'
    | 'trip_update'
    | 'prayer_request'
    | 'account_locked'
    | 'general'
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  relatedId: string | null
  $createdAt: string
  $updatedAt: string
}

// Stripe Processing Fee Constants
export const STRIPE_PERCENTAGE_FEE = 0.029 // 2.9%
export const STRIPE_FIXED_FEE = 0.3 // 30 cents
export const TRIP_ACTIVATION_FEE = 10.0 // $10 per trip

// Calculate processing fee
export function calculateProcessingFee(amount: number): number {
  return Number((amount * STRIPE_PERCENTAGE_FEE + STRIPE_FIXED_FEE).toFixed(2))
}

// Calculate total with processing fee
export function calculateTotalWithFee(amount: number): number {
  const fee = calculateProcessingFee(amount)
  return Number((amount + fee).toFixed(2))
}
