'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { useAuth } from '@/providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserDisplayName } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, User, Settings, HelpCircle, LogOut } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // ナビゲーションリンク
  const navLinks = [
    {
      name: 'ホーム',
      href: '/',
      active: pathname === '/',
    },
    {
      name: '機能',
      href: '/features',
      active: pathname === '/features',
    },
    {
      name: '料金',
      href: '/pricing',
      active: pathname === '/pricing',
    },
  ]

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* ロゴ・メニュー */}
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center">
            <span className="text-xl font-bold">SaaSテンプレート</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  link.active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* アクション */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {user ? (
            <>
              {/* デスクトップ表示 - ユーザーメニュー */}
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    ダッシュボード
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={getUserDisplayName(user)} />
                      <AvatarFallback>{getUserDisplayName(user).charAt(0)}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{getUserDisplayName(user)}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>ダッシュボード</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>設定</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/help" className="cursor-pointer">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>ヘルプ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600" 
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>ログアウト</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* モバイル表示 - ハンバーガーメニュー */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">メニューを開く</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <nav className="flex flex-col gap-6 mt-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <Avatar>
                          <AvatarImage src={user.photoURL || undefined} alt={getUserDisplayName(user)} />
                          <AvatarFallback>{getUserDisplayName(user).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{getUserDisplayName(user)}</p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>

                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`text-sm font-medium transition-colors hover:text-primary ${
                            link.active ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {link.name}
                        </Link>
                      ))}

                      <Link href="/dashboard" className="flex items-center font-medium">
                        <User className="mr-2 h-4 w-4" />
                        <span>ダッシュボード</span>
                      </Link>
                      <Link href="/dashboard/settings" className="flex items-center font-medium">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>設定</span>
                      </Link>
                      <Link href="/dashboard/help" className="flex items-center font-medium">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>ヘルプ</span>
                      </Link>

                      <Button 
                        variant="outline" 
                        className="justify-start mt-2 text-red-600" 
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>ログアウト</span>
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <>
              {/* 未認証時のボタン - デスクトップ */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    アカウント作成
                  </Button>
                </Link>
              </div>

              {/* 未認証時のボタン - モバイル */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">メニューを開く</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <nav className="flex flex-col gap-4 mt-8">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`text-sm font-medium transition-colors hover:text-primary ${
                            link.active ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                      
                      <div className="flex flex-col gap-2 mt-4">
                        <Link href="/sign-in">
                          <Button variant="outline" className="w-full">
                            ログイン
                          </Button>
                        </Link>
                        <Link href="/sign-up">
                          <Button className="w-full">
                            アカウント作成
                          </Button>
                        </Link>
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}