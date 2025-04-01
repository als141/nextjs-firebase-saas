/**
 * Firebase Firestore の初期化スクリプト
 * 
 * このスクリプトは、Firestoreのセキュリティルールとインデックスを設定し、
 * 必要なコレクションの初期設定を行います。
 * 
 * 使用方法:
 * 1. .env.local ファイルに Firebase の認証情報を設定
 * 2. `bun run scripts/init-firebase.js` を実行
 */

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Firebase Admin SDK の初期化
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: 'your-private-key-id', // 実際の値に置き換える
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: 'your-client-id', // 実際の値に置き換える
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
}

// Firebase Admin の初期化
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function initializeFirestore() {
  console.log('Firestore の初期化を開始します...')

  try {
    // ユーザーコレクションの作成
    console.log('ユーザーコレクションを設定中...')
    await ensureCollection('users')

    // サブスクリプションコレクションの作成
    console.log('サブスクリプションコレクションを設定中...')
    await ensureCollection('subscriptions')

    // プロジェクトコレクションの作成
    console.log('プロジェクトコレクションを設定中...')
    await ensureCollection('projects')

    // インボイスコレクションの作成
    console.log('インボイスコレクションを設定中...')
    await ensureCollection('invoices')

    console.log('Firestore の初期化が完了しました！')
  } catch (error) {
    console.error('Firestore の初期化中にエラーが発生しました:', error)
  }
}

// コレクションが存在することを確認する関数
async function ensureCollection(collectionName) {
  try {
    // コレクションの取得（存在確認）
    const collection = await db.collection(collectionName).limit(1).get()
    
    if (collection.empty) {
      console.log(`コレクション '${collectionName}' は空です`)
      
      // サンプルドキュメントの作成
      if (collectionName === 'users') {
        await createSampleUser()
      }
    } else {
      console.log(`コレクション '${collectionName}' は既に存在します`)
    }
  } catch (error) {
    console.error(`コレクション '${collectionName}' の確認中にエラーが発生しました:`, error)
    throw error
  }
}

// サンプルユーザーの作成
async function createSampleUser() {
  try {
    console.log('サンプルユーザーを作成中...')
    
    const sampleUser = {
      email: 'sample@example.com',
      displayName: 'サンプルユーザー',
      photoURL: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      emailNotifications: true,
      marketingEmails: false,
      securityEmails: true,
      updatesEmails: true,
    }
    
    await db.collection('users').doc('sample').set(sampleUser)
    console.log('サンプルユーザーを作成しました')
  } catch (error) {
    console.error('サンプルユーザーの作成中にエラーが発生しました:', error)
    throw error
  }
}

// Firestore のセキュリティルールの作成
async function createFirestoreRules() {
  try {
    console.log('Firestore セキュリティルールを作成中...')
    
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーが認証されているか確認する関数
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // 自分自身のドキュメントかどうか確認する関数
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ユーザーコレクション
    match /users/{userId} {
      allow read: if isUser(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isUser(userId);
      allow delete: if false; // ユーザー削除は管理者のみ許可
    }
    
    // サブスクリプションコレクション
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // サブスクリプションの作成・更新・削除はサーバーサイドのみ許可
    }
    
    // プロジェクトコレクション
    match /projects/{projectId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // インボイスコレクション
    match /invoices/{invoiceId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // インボイスの作成・更新・削除はサーバーサイドのみ許可
    }
  }
}
`
    
    // ルールファイルの作成
    fs.writeFileSync(path.join(__dirname, 'firestore.rules'), rules)
    console.log('Firestore セキュリティルールを作成しました')
  } catch (error) {
    console.error('Firestore セキュリティルールの作成中にエラーが発生しました:', error)
  }
}

// 実行
async function main() {
  try {
    await initializeFirestore()
    await createFirestoreRules()
    console.log('Firebase の初期化が完了しました！')
    process.exit(0)
  } catch (error) {
    console.error('Firebase の初期化中にエラーが発生しました:', error)
    process.exit(1)
  }
}

main()