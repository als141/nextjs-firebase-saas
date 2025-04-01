'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex flex-1 items-center justify-center">
        <div className="container flex flex-col items-center justify-center space-y-4 px-4 text-center md:px-6 py-16">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">エラーが発生しました</h1>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              申し訳ありません、予期しないエラーが発生しました。問題が解決しない場合は、サポートまでお問い合わせください。
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button onClick={() => reset()}>
              もう一度試す
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                ホームに戻る
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}