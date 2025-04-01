import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuth } from './lib/firebase/firebase-admin'

// 認証が必要なルート（ダッシュボードなど）のパターン
const PROTECTED_ROUTES = ['/dashboard', '/account', '/settings']

// 認証不要なルート（ログインやサインアップページなど）のパターン
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/reset-password']

// プレミアムプラン限定のルート
const PREMIUM_ROUTES = ['/dashboard/premium']

// リクエストがPREMIUM_ROUTESのいずれかに一致するか確認
function isPremiumRoute(pathname: string): boolean {
  return PREMIUM_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

// リクエストがPROTECTED_ROUTESのいずれかに一致するか確認
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

// リクエストがAUTH_ROUTESのいずれかに一致するか確認
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname === route)
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // APIルートは処理をスキップ
    if (pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    // 静的ファイルは処理をスキップ
    if (
      pathname.includes('.') || // ファイル拡張子を持つパス
      pathname.startsWith('/_next') || // Next.jsの内部ファイル
      pathname.startsWith('/favicon') // ファビコン
    ) {
      return NextResponse.next()
    }

    // セッションクッキーを取得
    const sessionCookie = request.cookies.get('session')?.value

    // 認証状態
    let isAuthenticated = false

    // セッションクッキーがある場合は検証
    if (sessionCookie) {
      try {
        // Firebase Admin SDKでセッショントークンを検証
        await adminAuth.verifySessionCookie(sessionCookie, true)
        isAuthenticated = true
      } catch (error) {
        console.error('セッション検証エラー:', error)
        isAuthenticated = false
      }
    }

    // 認証状態に基づいたリダイレクト処理
    if (isAuthenticated) {
      // 認証済みユーザーがログインページなどにアクセスした場合はダッシュボードへリダイレクト
      if (isAuthRoute(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // プレミアムルートへのアクセスはここで追加の権限チェックができる
      // 実際のアプリではFirestoreからサブスクリプション情報を取得して判断する
      if (isPremiumRoute(pathname)) {
        // ここでサブスクリプションチェックを実装
        // 現状では常に通過させる
      }
    } else {
      // 未認証ユーザーが保護されたルートにアクセスした場合はログインページへリダイレクト
      if (isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/sign-in', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// Middleware will run for all routes except the ones specified here
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}