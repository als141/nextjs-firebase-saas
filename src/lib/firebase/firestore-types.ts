// Firestore で使用するデータ型の定義
import { Timestamp } from 'firebase/firestore'

// ユーザー情報の型
export interface UserData {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  stripeCustomerId?: string
  // メール通知設定
  emailNotifications?: boolean
  marketingEmails?: boolean
  securityEmails?: boolean
  updatesEmails?: boolean
  // 追加のユーザープロファイル情報
  phoneNumber?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
}

// サブスクリプション情報の型
export interface SubscriptionData {
  id: string
  userId: string
  status: SubscriptionStatus
  priceId: string
  productId: string
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  createdAt: Timestamp
  endedAt: Timestamp | null
  canceledAt: Timestamp | null
  trialStart: Timestamp | null
  trialEnd: Timestamp | null
  customerId?: string
}

// 製品情報の型
export interface ProductData {
  id: string
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, any>
  images: string[]
  prices?: Record<string, PriceData>
}

// 価格情報の型
export interface PriceData {
  id: string
  productId: string
  active: boolean
  currency: string
  unitAmount: number
  interval?: 'day' | 'week' | 'month' | 'year'
  intervalCount?: number
  trialPeriodDays?: number | null
  type: 'one_time' | 'recurring'
  metadata: Record<string, any>
}

// サブスクリプションのステータス
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'

// ユーザーのサブスクリプション情報
export interface UserSubscriptionInfo {
  isSubscribed: boolean
  isPro: boolean
  isBusiness: boolean
  plan: string | null
  subscription: SubscriptionData | null
}

// Stripeインボイス型
export interface InvoiceData {
  id: string
  customerId?: string
  subscriptionId: string
  status: string
  total: number
  subtotal: number
  currency: string
  periodStart: Timestamp | null
  periodEnd: Timestamp | null
  created: Timestamp
  last_payment_error?: {
    message?: string
  }
  failureMessage?: string
}