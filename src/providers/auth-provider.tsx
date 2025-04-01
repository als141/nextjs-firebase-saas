'use client'

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode 
} from 'react'
import { 
  User,
  UserCredential,
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  getIdToken
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase/firebase'
import { UserData } from '@/lib/firebase/firestore-types'
import { toast } from 'sonner'

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null
  userData: UserData | null
  isLoading: boolean
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  logout: () => Promise<void>
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | null>(null)

// AuthProvider の props の型定義
interface AuthProviderProps {
  children: ReactNode
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // ユーザーデータをFirestoreから取得する関数
  const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData)
      } else {
        console.log('ユーザーデータが見つかりません')
        setUserData(null)
      }
    } catch (error) {
      console.error('ユーザーデータの取得に失敗しました:', error)
      setUserData(null)
    }
  }

  // 認証状態の変化を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        // ユーザーデータを取得
        fetchUserData(currentUser.uid)
        
        try {
          // IDトークンを取得してセッションAPIに送信
          const idToken = await getIdToken(currentUser)
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          })
          
          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'セッションの作成に失敗しました')
          }
        } catch (error) {
          console.error('セッション作成エラー:', error)
          // エラーがあってもユーザー体験を妨げないために続行
        }
      } else {
        setUserData(null)
        // セッションの削除
        try {
          await fetch('/api/auth/session', {
            method: 'DELETE',
          })
        } catch (error) {
          console.error('セッション削除エラー:', error)
        }
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ユーザー情報をFirestoreに保存する関数
  const saveUserToFirestore = async (user: User) => {
    if (!user.uid) return
    
    const userRef = doc(db, 'users', user.uid)
    const userSnapshot = await getDoc(userRef)
    
    if (!userSnapshot.exists()) {
      // 新規ユーザーの場合はFirestoreにデータを作成
      const userData: Omit<UserData, 'uid'> = {
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        emailNotifications: true,
        marketingEmails: false,
        securityEmails: true,
        updatesEmails: true,
      }
      
      await setDoc(userRef, userData)
    }
  }

  // メールとパスワードで登録
  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await saveUserToFirestore(result.user)
      return result
    } finally {
      setIsLoading(false)
    }
  }

  // メールとパスワードでサインイン
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } finally {
      setIsLoading(false)
    }
  }

  // Googleでサインイン
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await saveUserToFirestore(result.user)
      return result
    } finally {
      setIsLoading(false)
    }
  }

  // ログアウト
  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      // セッションを削除する前に通知
      toast.success('ログアウトしました')
    } finally {
      setIsLoading(false)
    }
  }

  // コンテキストの値
  const value = {
    user,
    userData,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}