'use client'

import { useEffect, useState } from 'react'
import { onSnapshot, doc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/providers/auth-provider'
import { SubscriptionData, UserSubscriptionInfo } from '@/lib/firebase/firestore-types'

// サブスクリプション情報を取得するカスタムフック
export function useSubscription(): {
  subscription: SubscriptionData | null
  isLoading: boolean
  subscriptionInfo: UserSubscriptionInfo
} {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Firestoreからサブスクリプション情報を取得
    const fetchSubscription = async () => {
      try {
        // アクティブなサブスクリプションを検索
        const subscriptionsRef = collection(db, 'subscriptions')
        const q = query(
          subscriptionsRef,
          where('userId', '==', user.uid),
          where('status', 'in', ['active', 'trialing'])
        )
        
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setSubscription(null)
          setIsLoading(false)
          return
        }
        
        // 最初のアクティブなサブスクリプションを使用
        setSubscription(querySnapshot.docs[0].data() as SubscriptionData)
        setIsLoading(false)
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error)
        setSubscription(null)
        setIsLoading(false)
      }
    }

    fetchSubscription()

    // リアルタイム更新のためのリスナーを設定
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.uid),
        where('status', 'in', ['active', 'trialing'])
      ),
      (snapshot) => {
        if (snapshot.empty) {
          setSubscription(null)
          return
        }
        
        // 最新のアクティブなサブスクリプションを使用
        setSubscription(snapshot.docs[0].data() as SubscriptionData)
      },
      (error) => {
        console.error('サブスクリプションの監視中にエラーが発生しました:', error)
      }
    )

    return () => unsubscribe()
  }, [user])

  // サブスクリプション情報から追加のステータス情報を抽出
  const subscriptionInfo: UserSubscriptionInfo = {
    isSubscribed: !!subscription && ['active', 'trialing'].includes(subscription.status),
    isPro: !!subscription && 
           ['active', 'trialing'].includes(subscription.status) && 
           subscription.productId === 'pro', // 実際のプロダクトIDに合わせて変更
    isBusiness: !!subscription && 
                ['active', 'trialing'].includes(subscription.status) && 
                subscription.productId === 'business', // 実際のプロダクトIDに合わせて変更
    plan: subscription ? subscription.productId : null,
    subscription,
  }

  return {
    subscription,
    isLoading,
    subscriptionInfo,
  }
}