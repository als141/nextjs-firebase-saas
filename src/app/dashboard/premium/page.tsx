'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/auth-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { toast } from 'sonner'
import {
  AlarmClock,
  ArrowRight,
  Download,
  FileText,
  LineChart,
  Lock,
  Unlock,
  BarChart,
  Star,
} from 'lucide-react'

export default function PremiumFeaturesPage() {
  const { user } = useAuth()
  const { subscriptionInfo, isLoading } = useSubscription()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<string | null>(null)

  if (!user) {
    return null
  }

  // プレミアムユーザーかどうか確認
  const isPremium = subscriptionInfo.isSubscribed

  // レポート生成機能
  const generateReport = async () => {
    if (!isPremium) {
      toast.error('この機能を利用するにはプレミアムプランへのアップグレードが必要です')
      return
    }

    setIsGenerating(true)
    setReportData(null)

    try {
      // レポート生成をシミュレート（実際にはAPIやデータ処理を行う）
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const sampleReport = `
# 分析レポート

## 概要
このレポートは過去30日間のプロジェクトデータを分析したものです。

## ハイライト
- 全体のトラフィックは前月比15%増加
- コンバージョン率は3.2%（前月比0.5%アップ）
- ユーザーセッション時間は平均4分32秒

## 推奨アクション
1. コンテンツの拡充
2. UI/UXの最適化
3. リターゲティングキャンペーンの強化

詳細な指標とグラフは完全版レポートを参照してください。
      `
      
      setReportData(sampleReport)
      toast.success('レポートが生成されました')
    } catch (error) {
      console.error('レポート生成エラー:', error)
      toast.error('レポートの生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="プレミアム機能"
        text="プレミアムプラン限定の高度な機能"
      >
        {!isPremium && (
          <Button asChild>
            <Link href="/pricing">
              <Star className="mr-2 h-4 w-4" />
              アップグレード
            </Link>
          </Button>
        )}
      </DashboardHeader>

      {!isPremium && (
        <Card className="mb-8 bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-muted-foreground" />
              プレミアム機能はロックされています
            </CardTitle>
            <CardDescription>
              これらの高度な機能を使用するにはプレミアムプランへのアップグレードが必要です
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              プレミアムプランでは、詳細な分析レポート、高度なデータエクスポート機能、AIを活用した予測などが利用できます。
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/pricing">
                プランを比較
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* 詳細分析レポート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {isPremium ? (
                <Unlock className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <Lock className="mr-2 h-5 w-5 text-muted-foreground" />
              )}
              詳細分析レポート
            </CardTitle>
            <CardDescription>
              ユーザー行動とパフォーマンスの詳細な分析
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-40 bg-muted rounded-md">
              <LineChart className="h-16 w-16 text-muted-foreground" />
            </div>
            
            {reportData && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50 whitespace-pre-wrap font-mono text-xs">
                {reportData}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="report-period">レポート期間:</Label>
              <select 
                id="report-period" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isPremium || isGenerating}
              >
                <option value="7">過去7日間</option>
                <option value="30">過去30日間</option>
                <option value="90">過去90日間</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={generateReport}
              disabled={!isPremium || isGenerating}
            >
              {isGenerating ? (
                <>
                  <AlarmClock className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  {isPremium ? 'レポートを生成' : 'プレミアム限定機能'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* データエクスポート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {isPremium ? (
                <Unlock className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <Lock className="mr-2 h-5 w-5 text-muted-foreground" />
              )}
              データエクスポート
            </CardTitle>
            <CardDescription>
              高度なフォーマットでデータをエクスポート
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-40 bg-muted rounded-md">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="export-type">エクスポート形式:</Label>
                <select
                  id="export-type"
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isPremium}
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="data-range">データ範囲:</Label>
                <select
                  id="data-range"
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isPremium}
                >
                  <option value="all">すべてのデータ</option>
                  <option value="filtered">フィルター済みデータ</option>
                  <option value="selection">選択項目のみ</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              disabled={!isPremium}
            >
              <Download className="mr-2 h-4 w-4" />
              {isPremium ? 'データをエクスポート' : 'プレミアム限定機能'}
            </Button>
          </CardFooter>
        </Card>

        {/* AI分析予測 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {isPremium ? (
                <Unlock className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <Lock className="mr-2 h-5 w-5 text-muted-foreground" />
              )}
              AI分析予測
            </CardTitle>
            <CardDescription>
              機械学習を使用したトレンド予測
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-40 bg-muted rounded-md">
              <BarChart className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prediction-target">予測対象:</Label>
              <Input
                id="prediction-target"
                placeholder="予測したい指標を入力"
                disabled={!isPremium}
              />
            </div>
            
            <div>
              <Label htmlFor="prediction-timeframe">予測期間:</Label>
              <select
                id="prediction-timeframe"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isPremium}
              >
                <option value="1m">1ヶ月</option>
                <option value="3m">3ヶ月</option>
                <option value="6m">6ヶ月</option>
                <option value="1y">1年</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={!isPremium}
            >
              {isPremium ? '予測を実行' : 'プレミアム限定機能'}
            </Button>
          </CardFooter>
        </Card>

        {/* プレミアムサポート */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {isPremium ? (
                <Unlock className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <Lock className="mr-2 h-5 w-5 text-muted-foreground" />
              )}
              優先サポート
            </CardTitle>
            <CardDescription>
              24時間以内の優先的な対応
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-40 bg-muted rounded-md">
              <Star className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support-subject">件名:</Label>
              <Input
                id="support-subject"
                placeholder="お問い合わせの件名"
                disabled={!isPremium}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support-message">メッセージ:</Label>
              <textarea 
                id="support-message"
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="詳細をご記入ください"
                disabled={!isPremium}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              disabled={!isPremium}
            >
              {isPremium ? 'サポートに問い合わせる' : 'プレミアム限定機能'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {!isPremium && (
        <div className="mt-8">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>プレミアム機能をアンロックしましょう</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                すべての高度な機能にアクセスして、可能性を最大限に引き出しましょう
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link href="/pricing">
                  プレミアムプランを見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </DashboardShell>
  )
}