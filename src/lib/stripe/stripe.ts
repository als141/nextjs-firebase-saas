// クライアントサイドの Stripe 初期化
import { loadStripe } from '@stripe/stripe-js'

// Stripe の公開キー
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Stripe インスタンスをキャッシュする変数
let stripePromise: Promise<any> | null = null

// Stripe.js をロードして Stripe インスタンスを返す関数
export const getStripe = () => {
  if (!stripePublishableKey) {
    console.error('Stripe publishable key is not defined')
    return null
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey)
  }

  return stripePromise
}

// SSR での初期化のためにダミーの stripe オブジェクトを作成
// これは実際には API ルートで stripe-admin.ts を使用する
export const stripe = {
  customers: {
    create: async () => {
      throw new Error('Direct use of stripe client in browser is not allowed')
    },
  },
  checkout: {
    sessions: {
      create: async () => {
        throw new Error('Direct use of stripe client in browser is not allowed')
      },
    },
  },
  // その他必要なダミーメソッド
}