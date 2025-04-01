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
const signInSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  password: z.string().min(1, { message: 'パスワードを入力してください' }),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  
  // リダイレクト先を取得
  const redirect = searchParams?.get('redirect') || '/dashboard'

  // フォームの初期化
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // メールとパスワードでのサインイン
  const onSubmit = async (values: SignInValues) => {
    try {
      setIsLoading(true)
      await signInWithEmail(values.email, values.password)
      toast.success('ログインしました')
      router.push(redirect)
    } catch (error: any) {
      console.error('サインインエラー:', error)
      
      // Firebase のエラーを日本語で表示
      let errorMessage = 'ログインに失敗しました'
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効になっています'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく経ってからお試しください'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Googleでのサインイン
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toast.success('Googleアカウントでログインしました')
      router.push(redirect)
    } catch (error: any) {
      console.error('Googleサインインエラー:', error)
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
            <h1 className="text-2xl font-bold">アカウントにログイン</h1>
            <p className="text-sm text-muted-foreground mt-2">
              アカウントをお持ちでないですか？{' '}
              <Link href="/sign-up" className="text-primary hover:underline">
                アカウント作成
              </Link>
            </p>
          </div>

          {/* サインインフォーム */}
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
                    <div className="flex items-center justify-between">
                      <FormLabel>パスワード</FormLabel>
                      <Link
                        href="/reset-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        パスワードをお忘れですか？
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを入力"
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
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  <>
                    ログイン
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
              onClick={handleGoogleSignIn}
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
              Googleでログイン
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}