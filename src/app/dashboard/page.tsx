'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/auth-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { getUserDisplayName } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  ArrowRight,
  Clock,
  LineChart,
  Activity,
  Zap,
  ShieldCheck,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { subscriptionInfo, isLoading } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // URLパラメータをチェック
    const success = searchParams?.get('success')
    
    if (success === 'true') {
      toast.success('サブスクリプションが正常に処理されました！')
    }
  }, [searchParams])

  if (!user) {
    return null
  }

  // ユーザーが最近ログインした情報
  const lastLogin = user.metadata?.lastSignInTime
    ? formatDate(new Date(user.metadata.lastSignInTime), 'yyyy年MM月dd日 HH:mm')
    : '不明'

  // サブスクリプション情報
  const isSubscribed = subscriptionInfo.isSubscribed
  const currentPlan = isSubscribed
    ? subscriptionInfo.isPro
      ? 'プロプラン'
      : subscriptionInfo.isBusiness
        ? 'ビジネスプラン'
        : '無料プラン'
    : '無料プラン'

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`こんにちは、${getUserDisplayName(user)}さん`}
        text="アカウントとプロジェクトの概要です"
      >
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/projects/new">
              新規プロジェクト
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {/* ステータスカード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                プロジェクト数
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                合計プロジェクト数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                現在のプラン
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPlan}</div>
              <p className="text-xs text-muted-foreground">
                {isSubscribed
                  ? subscriptionInfo.subscription?.cancelAtPeriodEnd
                    ? '期間終了後に終了予定'
                    : '自動更新'
                  : '無料利用中'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                使用状況
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <p className="text-xs text-muted-foreground">
                ストレージ使用量
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                前回のログイン
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{lastLogin}</div>
              <p className="text-xs text-muted-foreground">
                {user.metadata?.creationTime
                  ? `登録日: ${formatDate(new Date(user.metadata.creationTime), 'yyyy年MM月dd日')}`
                  : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* アクティビティと最近のプロジェクト */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>最近のプロジェクト</CardTitle>
              <CardDescription>
                最近作成または更新したプロジェクト
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {isLoading ? (
                <div className="text-center py-6 text-muted-foreground">
                  読み込み中...
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
                      <LayoutDashboard className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">SaaSダッシュボード</p>
                      <p className="text-sm text-muted-foreground">2日前に更新</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/projects/1">
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">プロジェクトを表示</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-green-100 dark:bg-green-900 mr-3">
                      <LineChart className="h-5 w-5 text-green-700 dark:text-green-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">アナリティクスアプリ</p>
                      <p className="text-sm text-muted-foreground">5日前に更新</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/projects/2">
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">プロジェクトを表示</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900 mr-3">
                      <Zap className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">マーケティングサイト</p>
                      <p className="text-sm text-muted-foreground">1週間前に更新</p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/projects/3">
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">プロジェクトを表示</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/projects">
                  すべてのプロジェクトを表示
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>アカウント概要</CardTitle>
              <CardDescription>
                アカウント情報とサブスクリプション状況
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">現在のプラン:</p>
                  <p className="text-sm">{currentPlan}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium">ステータス:</p>
                  <p className="text-sm">
                    {isSubscribed ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        アクティブ
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        無料プラン
                      </span>
                    )}
                  </p>
                </div>
                
                {isSubscribed && subscriptionInfo.subscription && (
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">次回更新日:</p>
                    <p className="text-sm">
                      {formatDate(new Date(subscriptionInfo.subscription.currentPeriodEnd.toDate()))}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">メールアドレス:</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium">最終ログイン:</p>
                  <p className="text-sm">{lastLogin}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-sm font-medium">アカウント作成日:</p>
                  <p className="text-sm">
                    {user.metadata?.creationTime
                      ? formatDate(new Date(user.metadata.creationTime))
                      : '不明'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </Link>
              </Button>
              
              <Button asChild size="sm">
                <Link href="/dashboard/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  プラン管理
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}