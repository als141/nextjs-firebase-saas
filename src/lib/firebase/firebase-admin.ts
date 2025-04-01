// Firebase Admin SDK の設定 (サーバーサイド用)
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// 環境変数からFirebase Admin SDKの認証情報を取得
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

// 認証情報が揃っているか確認
if (!projectId || !clientEmail || !privateKey) {
  console.error(
    'Firebase Admin SDK の認証情報が設定されていません。環境変数を確認してください。'
  )
}

// Firebase Admin アプリのインスタンスを取得/初期化
function getFirebaseAdminApp(): App {
  const apps = getApps()
  
  if (apps.length > 0) {
    return apps[0]
  }
  
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

// Firebase Admin アプリのインスタンスを取得
const app = getFirebaseAdminApp()

// Firebase Admin サービスのエクスポート
export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)