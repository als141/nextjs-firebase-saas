'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Users,
  HelpCircle,
  BarChart3,
} from 'lucide-react'

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  // 追加で必要なプロパティがあればここで定義
}

export function DashboardNav({ className, ...props }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: 'ダッシュボード',
      href: '/dashboard',
      icon: LayoutDashboard,
      variant: 'default',
    },
    {
      title: 'プロジェクト',
      href: '/dashboard/projects',
      icon: Users,
      variant: 'ghost',
    },
    {
      title: '分析',
      href: '/dashboard/analytics',
      icon: BarChart3,
      variant: 'ghost',
    },
    {
      title: '請求',
      href: '/dashboard/billing',
      icon: CreditCard,
      variant: 'ghost',
    },
    {
      title: '設定',
      href: '/dashboard/settings',
      icon: Settings,
      variant: 'ghost',
    },
    {
      title: 'ヘルプ',
      href: '/dashboard/help',
      icon: HelpCircle,
      variant: 'ghost',
    },
  ]

  return (
    <nav
      className={cn('flex flex-col space-y-1', className)}
      {...props}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: item.href === pathname ? 'default' : 'ghost', size: 'sm' }),
            item.href === pathname
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
              : 'hover:bg-muted hover:text-foreground',
            'justify-start w-full',
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}