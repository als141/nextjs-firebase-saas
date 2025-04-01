'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/providers/auth-provider'
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

// フォームのバリデーションスキーマ
const signUpSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z
    .string()
    .min(8, { message: 'パスワードは8文字以上である必要があります' })
    .max(100, { message: 'パスワードは100文字以下である必要があります' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type SignUpValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  
  // リダイレクト先を取得
  const redirect = searchParams?.get('redirect') || '/dashboard'

  // フォームの初期化
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // メールとパスワードでのサインアップ
  const onSubmit = async (values: SignUpValues) => {
    try {
      setIsLoading(true)
      await signUpWithEmail(values.email, values.password)
      toast.success('アカウントが作成されました')
      router.push(redirect)
    } catch (error: any) {
      console.error('サインアップエラー:', error)
      
      // Firebase のエラーを日本語で表示
      let errorMessage = 'アカウント作成に失敗しました'
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Googleでのサインアップ
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toast.success('Googleアカウントでログインしました')
      router.push(redirect)
    } catch (error: any) {
      console.error('Googleサインアップエラー:', error)
      toast.error('Googleでのログインに失敗しました')
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
            <h1 className="text-2xl font-bold">アカウント作成</h1>
            <p className="text-sm text-muted-foreground mt-2">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/sign-in" className="text-primary hover:underline">
                ログイン
              </Link>
            </p>
          </div>

          {/* サインアップフォーム */}
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
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="8文字以上のパスワード"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード（確認）</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを再入力"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
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
                    処理中...
                  </>
                ) : (
                  <>
                    アカウント作成
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                または
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5C13.6168 5 15.1013 5.55353 16.2863 6.47406L19.9235 3.00409C17.8088 1.13736 15.0406 0 12 0C7.3924 0 3.39667 2.59991 1.38553 6.40985L5.43724 9.60278C6.40926 6.91937 8.97242 5 12 5Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.8961 13.5018C23.9586 13.0102 24 12.5087 24 12C24 11.1422 23.9063 10.3068 23.7352 9.5H12V14.5H18.6037C18.0446 16.5142 16.7149 18.1651 15.0726 19.1851L19.0307 22.3773C21.2227 20.1149 22.6486 17.0898 23.0962 13.5018H23.8961Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5 12C5 11.1566 5.15686 10.3516 5.43724 9.60278L1.38553 6.40985C0.504362 8.08002 0 9.98016 0 12C0 13.9973 0.495026 15.8763 1.35832 17.533L5.40677 14.2703C5.14453 13.5403 5 12.7855 5 12Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 19C8.95447 19 6.37042 17.0515 5.40674 14.2703L1.35828 17.533C3.35925 21.3735 7.36981 24 12 24C15.0278 24 17.7888 22.8752 19.9080 21.0767L15.9499 17.8846C14.7673 18.5626 13.4141 19 12 19Z"
                    fill="#34A853"
                  />
                </svg>
              )}
              Googleでサインアップ
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            サインアップすることで、
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              利用規約
            </Link>と
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              プライバシーポリシー
            </Link>に同意したことになります。
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}