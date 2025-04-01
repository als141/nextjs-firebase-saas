import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex flex-1 items-center justify-center">
        <div className="container flex flex-col items-center justify-center space-y-4 px-4 text-center md:px-6 py-16">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404 - ページが見つかりません</h1>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              お探しのページは存在しないか、移動された可能性があります。
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button asChild>
              <Link href="/">
                ホームに戻る
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                ダッシュボード
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}