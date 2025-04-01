'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/providers/auth-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PLANS } from '@/lib/stripe/stripe-admin'
import { formatDate, formatPrice, translateSubscriptionStatus } from '@/lib/utils'
import { toast } from 'sonner'
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  LucideIcon,
  Package,
  StarIcon,
} from 'lucide-react'

export default function BillingPage() {
  const { user } = useAuth()
  const { subscription, isLoading, subscriptionInfo } = useSubscription()
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URLパラメータをチェック
  const success = searchParams?.get('success') === 'true'
  const canceled = searchParams?.get('canceled') === 'true'

  if (!user) {
    return null
  }

  // カスタマーポータルへのリダイレクト
  const redirectToCustomerPortal = async () => {
    try {
      setIsManagingSubscription(true)
      
      // バックエンドAPIを呼び出してStripeカスタマーポータルへのリンクを取得
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('カスタマーポータルの作成に失敗しました')
      }
      
      const { url } = await response.json()
      
      // ポータルにリダイレクト
      window.location.href = url
    } catch (error: any) {
      console.error('カスタマーポータルエラー:', error)
      toast.error(error.message || 'カスタマーポータルへのリダイレクトに失敗しました')
    } finally {
      setIsManagingSubscription(false)
    }
  }

  // 現在のプラン情報を取得
  const currentPlan = PLANS.find(plan => {
    if (!subscriptionInfo.isSubscribed) return plan.id === 'free'
    if (subscriptionInfo.isPro) return plan.id === 'pro'
    if (subscriptionInfo.isBusiness) return plan.id === 'business'
    return plan.id === 'free'
  })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="請求と課金"
        text="サブスクリプションと請求設定の管理"
      >
        <Button asChild variant="outline">
          <Link href="/pricing">
            プランを比較
          </Link>
        </Button>
      </DashboardHeader>

      {success && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>サブスクリプションが更新されました</AlertTitle>
          <AlertDescription>
            お支払いが正常に処理され、サブスクリプションが更新されました。
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>チェックアウトがキャンセルされました</AlertTitle>
          <AlertDescription>
            引き続き現在のプランをご利用いただけます。
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8">
        {/* 現在のプラン */}
        <Card>
          <CardHeader>
            <CardTitle>現在のプラン</CardTitle>
            <CardDescription>
              サブスクリプションの詳細と管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold">
                        {currentPlan?.name || '無料プラン'}
                      </h3>
                      {subscriptionInfo.isSubscribed && (
                        <div className="ml-3 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {subscription?.cancelAtPeriodEnd
                            ? '期間終了時に終了'
                            : 'アクティブ'}
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {subscriptionInfo.isSubscribed
                        ? `${formatPrice(currentPlan?.price || 0)} / ${
                            currentPlan?.interval === 'month' ? '月' : '年'
                          }`
                        : '無料プラン'}
                    </p>
                  </div>

                  {subscriptionInfo.isSubscribed ? (
                    <Button
                      onClick={redirectToCustomerPortal}
                      disabled={isManagingSubscription}
                    >
                      {isManagingSubscription ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          サブスクリプションを管理
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/pricing">
                        <StarIcon className="mr-2 h-4 w-4" />
                        アップグレード
                      </Link>
                    </Button>
                  )}
                </div>

                {subscriptionInfo.isSubscribed && subscription && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                        <div className="text-sm text-muted-foreground">ステータス</div>
                        <div className="text-sm font-medium">
                          {translateSubscriptionStatus(subscription.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">サブスクリプションID</div>
                        <div className="text-sm font-mono">
                          {subscription.id.substring(0, 14)}...
                        </div>
                        
                        <div className="text-sm text-muted-foreground">更新日</div>
                        <div className="text-sm font-medium">
                          {formatDate(new Date(subscription.currentPeriodEnd.toDate()))}
                        </div>
                        
                        {subscription.cancelAtPeriodEnd && (
                          <>
                            <div className="text-sm text-muted-foreground">終了予定日</div>
                            <div className="text-sm font-medium">
                              {formatDate(new Date(subscription.currentPeriodEnd.toDate()))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {subscriptionInfo.isSubscribed && subscription?.cancelAtPeriodEnd && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>サブスクリプションは終了予定です</AlertTitle>
                    <AlertDescription>
                      サブスクリプションは{' '}
                      <span className="font-semibold">
                        {formatDate(new Date(subscription.currentPeriodEnd.toDate()))}
                      </span>{' '}
                      に終了します。アクセスを維持するにはサブスクリプションを再開してください。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 請求情報 */}
        <Card>
          <CardHeader>
            <CardTitle>請求情報</CardTitle>
            <CardDescription>
              請求先情報と支払い履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionInfo.isSubscribed ? (
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={redirectToCustomerPortal}
                  disabled={isManagingSubscription}
                  className="w-full sm:w-auto"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  請求履歴を表示
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  請求履歴はありません
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  有料プランにアップグレードすると、ここに請求情報が表示されます。
                </p>
                <Button asChild>
                  <Link href="/pricing">
                    有料プランを表示
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* サポート */}
        <Card>
          <CardHeader>
            <CardTitle>サポート</CardTitle>
            <CardDescription>
              請求や課金に関するヘルプが必要ですか？
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard/help">
                ヘルプセンター
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <a href="mailto:support@example.com">
                サポートに問い合わせる
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}