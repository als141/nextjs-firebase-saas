'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, UserCircle, Mail, Lock, Bell, Smartphone, LogOut, Loader2 } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/providers/auth-provider'
import { getUserDisplayName } from '@/lib/utils'
import { toast } from 'sonner'
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

// プロフィール更新のバリデーションスキーマ
const profileFormSchema = z.object({
  displayName: z.string().max(50, { message: '表示名は50文字以内で入力してください' }),
})

// パスワード変更のバリデーションスキーマ
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: '現在のパスワードを入力してください' }),
  newPassword: z.string().min(8, { message: 'パスワードは8文字以上である必要があります' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '新しいパスワードが一致しません',
  path: ['confirmPassword'],
})

// 通知設定のバリデーションスキーマ
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  securityEmails: z.boolean().default(true),
  updatesEmails: z.boolean().default(true),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export default function SettingsPage() {
  const { user, userData, logout } = useAuth()
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    notifications: false,
    logout: false,
  })
  
  if (!user) {
    return null
  }

  // プロフィールフォームの設定
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user.displayName || '',
    },
  })

  // パスワードフォームの設定
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // 通知設定フォームの設定
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: userData?.emailNotifications ?? true,
      marketingEmails: userData?.marketingEmails ?? false,
      securityEmails: userData?.securityEmails ?? true,
      updatesEmails: userData?.updatesEmails ?? true,
    },
  })

  // プロフィール更新の処理
  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return
    
    try {
      setIsLoading((prev) => ({ ...prev, profile: true }))
      
      // Firebaseの認証プロフィールを更新
      await updateProfile(user, {
        displayName: values.displayName,
      })
      
      // Firestoreのユーザードキュメントも更新
      if (userData) {
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          displayName: values.displayName,
          updatedAt: new Date(),
        })
      }
      
      toast.success('プロフィールが更新されました')
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      toast.error('プロフィールの更新に失敗しました')
    } finally {
      setIsLoading((prev) => ({ ...prev, profile: false }))
    }
  }

  // パスワード変更の処理
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (!user || !user.email) return
    
    try {
      setIsLoading((prev) => ({ ...prev, password: true }))
      
      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      )
      
      await reauthenticateWithCredential(user, credential)
      
      // パスワード更新
      await updatePassword(user, values.newPassword)
      
      toast.success('パスワードが変更されました')
      passwordForm.reset()
    } catch (error: any) {
      console.error('パスワード変更エラー:', error)
      
      let errorMessage = 'パスワードの変更に失敗しました'
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = '現在のパスワードが正しくありません'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '新しいパスワードが弱すぎます'
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'セキュリティのため再ログインが必要です'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading((prev) => ({ ...prev, password: false }))
    }
  }

  // 通知設定の更新処理
  const onNotificationsSubmit = async (values: NotificationsFormValues) => {
    if (!user) return
    
    try {
      setIsLoading((prev) => ({ ...prev, notifications: true }))
      
      // Firestoreのユーザードキュメントを更新
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        emailNotifications: values.emailNotifications,
        marketingEmails: values.marketingEmails,
        securityEmails: values.securityEmails,
        updatesEmails: values.updatesEmails,
        updatedAt: new Date(),
      })
      
      toast.success('通知設定が更新されました')
    } catch (error: any) {
      console.error('通知設定更新エラー:', error)
      toast.error('通知設定の更新に失敗しました')
    } finally {
      setIsLoading((prev) => ({ ...prev, notifications: false }))
    }
  }

  // ログアウト処理
  const handleLogout = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, logout: true }))
      await logout()
    } catch (error) {
      console.error('ログアウトエラー:', error)
      toast.error('ログアウトに失敗しました')
      setIsLoading((prev) => ({ ...prev, logout: false }))
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="設定"
        text="アカウント設定と環境設定を管理します"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            プロフィール
          </TabsTrigger>
          <TabsTrigger value="password">
            <Lock className="mr-2 h-4 w-4" />
            パスワード
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            通知
          </TabsTrigger>
        </TabsList>
        
        {/* プロフィール設定 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール</CardTitle>
              <CardDescription>
                アカウント情報やプロフィールを管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || undefined} alt={getUserDisplayName(user)} />
                  <AvatarFallback>
                    <UserCircle className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{getUserDisplayName(user)}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>表示名</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading.profile} />
                        </FormControl>
                        <FormDescription>
                          他のユーザーに表示される名前です
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      メールアドレスを変更するには再認証が必要です
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading.profile}
                  >
                    {isLoading.profile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      '変更を保存'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* パスワード設定 */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>パスワード</CardTitle>
              <CardDescription>
                アカウントのパスワードを変更します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>現在のパスワード</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading.password}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新しいパスワード</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading.password}
                          />
                        </FormControl>
                        <FormDescription>
                          8文字以上の強力なパスワードを設定してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワードの確認</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isLoading.password}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={isLoading.password}
                  >
                    {isLoading.password ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      'パスワードを変更'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 通知設定 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知</CardTitle>
              <CardDescription>
                通知のカスタマイズと設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
                  <div className="space-y-4">
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">メール通知</FormLabel>
                            <FormDescription>
                              アプリからのメール通知を受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">マーケティングメール</FormLabel>
                            <FormDescription>
                              新機能や特別オファーに関する情報を受け取る
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="securityEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">セキュリティメール</FormLabel>
                            <FormDescription>
                              アカウントのセキュリティに関する重要な通知
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled // セキュリティメールは必須
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="updatesEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">更新情報</FormLabel>
                            <FormDescription>
                              サービスの更新や変更に関する通知
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="submit"
                      disabled={isLoading.notifications}
                    >
                      {isLoading.notifications ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          更新中...
                        </>
                      ) : (
                        '設定を保存'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* アカウント削除セクション */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>アカウント管理</CardTitle>
            <CardDescription>
              アカウントのログアウトと管理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">ログアウト</p>
                  <p className="text-sm text-muted-foreground">
                    すべてのデバイスからログアウトします
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading.logout}
                >
                  {isLoading.logout ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      ログアウト
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-destructive/10 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-destructive">アカウントの削除</p>
                  <p className="text-sm text-muted-foreground">
                    アカウントを完全に削除します。この操作は取り消せません。
                  </p>
                </div>
                <Button variant="destructive">
                  アカウントを削除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}