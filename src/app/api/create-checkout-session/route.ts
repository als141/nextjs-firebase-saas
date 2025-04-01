import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe-admin'
import { adminAuth } from '@/lib/firebase/firebase-admin'
import { cookies } from 'next/headers'
import { getStripeCustomerId, createStripeCustomer } from '@/lib/stripe/stripe-admin'

export async function POST(req: Request) {
  try {
    // セッションクッキーを取得
    const sessionCookie = cookies().get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // Firebase Admin SDKでセッショントークンを検証
    let decodedClaims
    try {
      decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    } catch (error) {
      console.error('セッション検証エラー:', error)
      return NextResponse.json(
        { error: '無効なセッションです。再度ログインしてください' },
        { status: 401 }
      )
    }

    const userId = decodedClaims.uid

    // リクエストからpriceIdとreturnUrlを取得
    const { priceId, returnUrl } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: '料金IDが必要です' },
        { status: 400 }
      )
    }

    // ユーザー情報を取得
    const user = await adminAuth.getUser(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // StripeにCustomerを作成または取得
    let customerId = await getStripeCustomerId(userId)

    if (!customerId) {
      customerId = await createStripeCustomer({
        userId,
        email: user.email || undefined,
        name: user.displayName || undefined,
      })
    }

    // Stripeチェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('チェックアウトセッションの作成に失敗しました:', error)
    return NextResponse.json(
      {
        error: error.message || 'チェックアウトセッションの作成に失敗しました',
      },
      { status: 500 }
    )
  }
}