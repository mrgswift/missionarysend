import { type Models } from 'node-appwrite'

export type Users = Models.Row & {
  createdBy: string
  accountType: string
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
}

export type OrganizationMembers = Models.Row & {
  createdBy: string
  organizationId: string
  memberUserId: string
  memberEmail: string
  memberName: string
}

export type Trips = Models.Row & {
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
}

export type TripFollowers = Models.Row & {
  createdBy: string
  tripId: string
  followerUserId: string
  followerName: string
  followerEmail: string
  followerPhone: string | null
  inviteToken: string | null
}

export type Donations = Models.Row & {
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
  missionaryId: string | null
}

export type TripUpdates = Models.Row & {
  createdBy: string
  tripId: string
  title: string
  content: string
  notificationSent: boolean
}

export type Comments = Models.Row & {
  createdBy: string
  parentType: string
  parentId: string
  content: string
  authorName: string
  parentCommentId: string | null
}

export type Reactions = Models.Row & {
  createdBy: string
  commentId: string
  reactionType: string
  userId: string
}

export type JournalEntries = Models.Row & {
  createdBy: string
  tripId: string
  title: string
  content: string
  isPrivate: boolean
}

export type PrayerIntercessors = Models.Row & {
  createdBy: string
  tripId: string
  intercessorUserId: string
  intercessorName: string
  intercessorEmail: string
}

export type PrayerRequests = Models.Row & {
  createdBy: string
  tripId: string
  title: string
  content: string
  notificationSent: boolean
}

export type Notifications = Models.Row & {
  createdBy: string
  userId: string
  type: string
  title: string
  message: string
  linkUrl: string | null
  isRead: boolean
  relatedId: string | null
  isVisible: boolean
}

export type TripMissionaries = Models.Row & {
  createdBy: string
  tripId: string
  missionaryUserId: string
  missionaryName: string
  fundraisingGoal: number
  fundraisingProgress: number
}
