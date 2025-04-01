'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getStripe } from '@/lib/stripe/stripe-admin'

interface PricingCardProps {
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  priceId: string
  popular?: boolean
  isCurrent?: boolean
}

export function PricingCard({
  name,
  description,
  price,
  interval,
  features,
  priceId,
  popular = false,
  isCurrent = false,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!user) {
      // ユーザーが認証されていない場合はログインページにリダイレクト
      router.push('/sign-in?redirect=/pricing')
      return
    }

    try {
      setIsLoading(true)

      // Stripe Checkout セッションを作成するAPIを呼び出し
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          returnUrl: window.location.origin,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'チェックアウトセッションの作成に失敗しました')
      }

      const { sessionId } = await response.json()

      // Stripe.js を読み込む
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe の読み込みに失敗しました')
      }

      // Checkout ページにリダイレクト
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        toast.error(error.message || 'チェックアウトページへのリダイレクトに失敗しました')
      }
    } catch (error: any) {
      console.error('チェックアウトエラー:', error)
      toast.error(error.message || 'エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`flex flex-col ${popular ? 'border-primary' : ''} ${isCurrent ? 'bg-secondary/20' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            人気プラン
          </span>
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          <span className="ml-1 text-muted-foreground">/{interval === 'month' ? '月' : '年'}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${popular ? 'bg-primary' : ''}`}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrent}
        >
          {isLoading
            ? '処理中...'
            : isCurrent
            ? '現在のプラン'
            : price === 0
            ? '無料で始める'
            : '今すぐ始める'}
        </Button>
      </CardFooter>
    </Card>
  )
}