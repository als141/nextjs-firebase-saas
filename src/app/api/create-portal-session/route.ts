import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe-admin'
import { adminAuth } from '@/lib/firebase/firebase-admin'
import { cookies } from 'next/headers'
import { getStripeCustomerId } from '@/lib/stripe/stripe-admin'

export async function POST(req: Request) {
  try {
    // セッションクッキーを取得
    const cookiesStore = await cookies()
    const sessionCookie = (await cookiesStore.get('session'))?.value

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

    // StripeのカスタマーIDを取得
    const customerId = await getStripeCustomerId(userId)

    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripeカスタマーが見つかりません' },
        { status: 404 }
      )
    }

    // Stripeカスタマーポータルセッションを作成
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('カスタマーポータルセッションの作成に失敗しました:', error)
    return NextResponse.json(
      {
        error: error.message || 'カスタマーポータルセッションの作成に失敗しました',
      },
      { status: 500 }
    )
  }
}