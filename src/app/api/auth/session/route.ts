import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/firebase-admin'
import { cookies } from 'next/headers'

// セッションの作成API（ログイン後に呼び出される）
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'IDトークンが必要です' },
        { status: 400 }
      )
    }

    // セッションクッキーの有効期限（デフォルトは2週間）
    const expiresIn = 60 * 60 * 24 * 14 * 1000

    // Firebaseからセッションクッキーを作成
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    })

    // セキュアなクッキーを設定
    const cookiesStore = await cookies()
    await cookiesStore.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('セッション作成エラー:', error)
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました' },
      { status: 401 }
    )
  }
}

// セッションの検証API
export async function GET() {
  try {
    const cookiesStore = await cookies()
    const sessionCookie = (await cookiesStore.get('session'))?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // セッションクッキーを検証
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // セッションが失効していないか確認
    )

    return NextResponse.json({
      authenticated: true,
      uid: decodedClaims.uid,
    })
  } catch (error) {
    console.error('セッション検証エラー:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

// セッションの削除API（ログアウト時に呼び出される）
export async function DELETE() {
  try {
    // セッションクッキーを削除
    const cookiesStore = await cookies()
    await cookiesStore.delete('session')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('セッション削除エラー:', error)
    return NextResponse.json(
      { error: 'セッションの削除に失敗しました' },
      { status: 500 }
    )
  }
}