import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react'

export default function Home() {
  // 主要な機能リスト
  const features = [
    {
      title: 'Firebase 認証',
      description: 'Googleアカウントやメール・パスワードでの認証に対応',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Stripe 決済',
      description: 'サブスクリプションと従量課金のサポート',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: 'ダッシュボード',
      description: 'ユーザーと管理者向けのダッシュボード',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: 'レスポンシブデザイン',
      description: 'モバイルからデスクトップまで対応',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: 'ダークモード',
      description: 'ライト/ダークテーマ切り替え対応',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      title: 'TypeScript',
      description: '型安全なコーディング環境',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Next.js + Firebase + Stripe<br />
                <span className="text-primary">SaaS スターターキット</span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
                認証、データベース、決済が組み込まれた完全なSaaSスターターテンプレート。
                最新のツールとベストプラクティスで構築されています。
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/sign-up">
                    無料で始める <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">
                    料金プランを見る
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">主な機能</h2>
              <p className="mt-4 text-muted-foreground">
                すぐに使える機能で迅速に開発を始められます
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-background p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* テクノロジースタックセクション */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">テクノロジースタック</h2>
              <p className="mt-4 text-muted-foreground">
                最新のWebテクノロジーを使用して構築されています
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-6">
              {[
                { name: 'Next.js', logo: '/next.svg' },
                { name: 'React', logo: '/react.svg' },
                { name: 'TypeScript', logo: '/typescript.svg' },
                { name: 'Firebase', logo: '/firebase.svg' },
                { name: 'Stripe', logo: '/stripe.svg' },
                { name: 'Tailwind CSS', logo: '/tailwind.svg' },
              ].map((tech) => (
                <div key={tech.name} className="flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted p-4">
                    {/* 実際にはロゴ画像を表示 */}
                    <div className="text-lg font-bold text-primary">{tech.name.charAt(0)}</div>
                  </div>
                  <p className="mt-2 font-medium">{tech.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              今すぐ始めましょう
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              無料プランで試すことも、プレミアム機能をすぐに利用することもできます。
              スケーラブルなSaaSアプリケーションを今日から始めましょう。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/sign-up">
                  無料アカウントを作成
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/pricing">
                  料金プランを見る
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}