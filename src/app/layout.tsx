import './globals.css'
import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Providers } from '@/providers/providers'
import { Toaster } from 'sonner'

// フォントの設定
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

// メタデータ
export const metadata: Metadata = {
  title: 'SaaS プラットフォーム',
  description: 'Next.js、Firebase、Stripeで構築されたSaaSスターターテンプレート',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}