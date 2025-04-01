import { stripe } from '@/lib/stripe/stripe'
import { adminDb } from '@/lib/firebase/firebase-admin'

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