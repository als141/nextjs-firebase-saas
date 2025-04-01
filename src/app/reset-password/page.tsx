'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase'

// フォームのバリデーションスキーマ
const resetPasswordSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const router = useRouter()

  // フォームの初期化
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  // パスワードリセットメールの送信
  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      setIsLoading(true)
      
      await sendPasswordResetEmail(auth, values.email)
      
      setIsEmailSent(true)
      toast.success('パスワードリセットのメールを送信しました')
    } catch (error: any) {
      console.error('パスワードリセットエラー:', error)
      
      // Firebase のエラーを日本語で表示
      let errorMessage = 'パスワードリセットに失敗しました'
      
      if (error.code === 'auth/user-not-found') {
        // セキュリティ上の理由からユーザーが存在しないことを明示しない
        // 代わりに成功したふりをする
        setIsEmailSent(true)
        return
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'リクエスト回数が多すぎます。しばらく経ってからお試しください'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md p-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">パスワードをリセット</h1>
            <p className="text-sm text-muted-foreground mt-2">
              アカウントに関連付けられたメールアドレスを入力してください
            </p>
          </div>

          {isEmailSent ? (
            <div className="space-y-6 text-center">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">メールを送信しました</p>
                <p className="text-sm text-muted-foreground mt-2">
                  パスワードリセットの手順が記載されたメールを送信しました。
                  メールの指示に従ってパスワードをリセットしてください。
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEmailSent(false)}
                >
                  別のメールアドレスを試す
                </Button>
                
                <Link href="/sign-in">
                  <Button
                    variant="link"
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    ログインに戻る
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    'リセットリンクを送信'
                  )}
                </Button>
                
                <div className="text-center">
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    ログインページに戻る
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}