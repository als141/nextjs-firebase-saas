'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Info } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PricingCard } from '@/components/pricing-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { PLANS } from '@/lib/stripe/stripe-admin'
import { toast } from 'sonner'

export default function PricingPage() {
  const { user } = useAuth()
  const { subscriptionInfo, isLoading: isSubscriptionLoading } = useSubscription()
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showCanceledMessage, setShowCanceledMessage] = useState(false)
  const [showPremiumRequiredMessage, setShowPremiumRequiredMessage] = useState(false)

  useEffect(() => {
    // URLパラメータをチェック
    const success = searchParams?.get('success')
    const canceled = searchParams?.get('canceled')
    const notice = searchParams?.get('notice')
    
    if (success === 'true') {
      setShowSuccessMessage(true)
      toast.success('サブスクリプションの更新が完了しました！')
    }
    
    if (canceled === 'true') {
      setShowCanceledMessage(true)
    }
    
    if (notice === 'premium_required') {
      setShowPremiumRequiredMessage(true)
      toast.error('この機能にはプレミアムプランへのアップグレードが必要です')
    }
  }, [searchParams])

  // サポート機能の一覧
  const supportedFeatures = [
    'SSL対応',
    'メールサポート',
    'データバックアップ',
    '99.9%稼働時間保証',
    'セキュリティアップデート',
    'APIアクセス',
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container px-4">
          {/* タイトルとサブタイトル */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              シンプルで透明な料金体系
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              あなたのニーズに合わせた柔軟なプランをご用意しています。いつでもアップグレードやダウングレードが可能です。
            </p>
          </div>

          {/* 通知メッセージ */}
          {showSuccessMessage && (
            <div className="mb-8 rounded-lg border-green-600/20 bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-green-800 dark:text-green-400">
                サブスクリプションが正常に処理されました！新しいプランでご利用いただけます。
              </p>
            </div>
          )}

          {showCanceledMessage && (
            <div className="mb-8 rounded-lg border-blue-600/20 bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-blue-800 dark:text-blue-400">
                チェックアウトがキャンセルされました。引き続き現在のプランをご利用いただけます。
              </p>
            </div>
          )}

          {showPremiumRequiredMessage && (
            <div className="mb-8 rounded-lg border-amber-600/20 bg-amber-50 p-4 dark:bg-amber-900/20">
              <div className="flex items-start">
                <Info className="mt-0.5 mr-3 h-5 w-5 text-amber-600 dark:text-amber-400" />
                <p className="text-amber-800 dark:text-amber-400">
                  この機能にアクセスするには、プレミアムプランへのアップグレードが必要です。
                </p>
              </div>
            </div>
          )}

          {/* 価格カード */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {PLANS.map((plan) => {
              const isCurrent = 
                !isSubscriptionLoading && 
                subscriptionInfo.isSubscribed && 
                (
                  (plan.id === 'pro' && subscriptionInfo.isPro) ||
                  (plan.id === 'business' && subscriptionInfo.isBusiness) ||
                  (plan.id === 'free' && !subscriptionInfo.isPro && !subscriptionInfo.isBusiness)
                )

              return (
                <PricingCard
                  key={plan.id}
                  name={plan.name}
                  description={plan.description}
                  price={plan.price}
                  interval={plan.interval}
                  features={plan.features}
                  priceId={plan.priceId}
                  popular={plan.popular}
                  isCurrent={isCurrent}
                />
              )
            })}
          </div>

          {/* すべてのプランに含まれる機能 */}
          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold">すべてのプランに含まれる機能</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
              {supportedFeatures.map((feature) => (
                <div key={feature} className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* カスタムプラン */}
          <div className="mt-24 bg-muted/50 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold">カスタムプランが必要ですか？</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                大規模なプロジェクトや特別な要件がある場合は、カスタムプランをご用意します。
                営業チームにお問い合わせください。
              </p>
              <Button className="mt-6" asChild>
                <a href="mailto:sales@example.com">お問い合わせ</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}