import Stripe from 'stripe'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { getStripe } from './stripe'

// Stripe APIの初期化
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia', // 最新の API バージョンを使用
})

// 価格プラン定義
export const PLANS = [
  {
    id: 'free',
    name: '無料プラン',
    description: '個人の利用に最適',
    price: 0,
    priceId: '',
    interval: 'month' as const,
    features: [
      '3つまでのプロジェクト',
      'コミュニティサポート',
      '基本的な機能',
    ],
  },
  {
    id: 'pro',
    name: 'プロプラン',
    description: 'プロフェッショナルのニーズに',
    price: 2000,
    priceId: 'price_pro_monthly', // 実際のStripe価格IDに置き換えてください
    interval: 'month' as const,
    features: [
      '無制限のプロジェクト',
      '優先サポート',
      'すべての機能にアクセス',
      'API使用権',
      'チーム機能',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'ビジネスプラン',
    description: 'チームと大規模組織向け',
    price: 5000,
    priceId: 'price_business_monthly', // 実際のStripe価格IDに置き換えてください
    interval: 'month' as const,
    features: [
      '無制限のプロジェクト',
      '24時間サポート',
      'すべての機能にアクセス',
      '高度なAPI使用権',
      '拡張チーム機能',
      'カスタム統合',
    ],
  },
]

// クライアントサイド用のgetStripe関数をフロントエンドでも使用できるようにエクスポート
export { getStripe }

// ユーザーのStripeカスタマーIDを取得する関数
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      console.log(`User ${userId} not found in Firestore`)
      return null
    }

    const userData = userDoc.data()
    
    if (userData?.stripeCustomerId) {
      return userData.stripeCustomerId
    }

    return null
  } catch (error) {
    console.error('Error getting Stripe customer ID:', error)
    return null
  }
}

// Stripe顧客を作成する関数
interface CreateCustomerParams {
  userId: string
  email?: string
  name?: string
  metadata?: Record<string, string>
}

export async function createStripeCustomer({
  userId,
  email,
  name,
  metadata = {},
}: CreateCustomerParams): Promise<string> {
  try {
    // Stripeで顧客を作成
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        ...metadata,
      },
    })

    // FirestoreにStripeのカスタマーIDを保存
    await adminDb.collection('users').doc(userId).update({
      stripeCustomerId: customer.id,
      updatedAt: new Date(),
    })

    return customer.id
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

// サブスクリプションを取得する関数
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

// 製品情報を取得する関数
export async function getProducts() {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    })
    return products.data
  } catch (error) {
    console.error('Error retrieving products:', error)
    return []
  }
}

// 価格情報を取得する関数
export async function getPrices() {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    })
    return prices.data
  } catch (error) {
    console.error('Error retrieving prices:', error)
    return []
  }
}