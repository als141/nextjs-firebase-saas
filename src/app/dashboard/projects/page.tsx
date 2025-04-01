'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/providers/auth-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import {
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Settings,
  ArrowUpDown,
  Globe,
  Layout,
  LineChart,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// サンプルプロジェクトデータ
const SAMPLE_PROJECTS = [
  {
    id: '1',
    name: 'SaaSダッシュボード',
    description: '顧客向けダッシュボードアプリケーション',
    type: 'web',
    status: 'active',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    users: 5,
    icon: Layout,
  },
  {
    id: '2',
    name: 'アナリティクスアプリ',
    description: 'データ分析と可視化ツール',
    type: 'web',
    status: 'active',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    users: 3,
    icon: LineChart,
  },
  {
    id: '3',
    name: 'マーケティングサイト',
    description: '企業のマーケティングウェブサイト',
    type: 'web',
    status: 'archived',
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    users: 2,
    icon: Globe,
  },
]

export default function ProjectsPage() {
  const { user } = useAuth()
  const { subscriptionInfo } = useSubscription()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'active', 'archived'

  if (!user) {
    return null
  }

  // プロジェクトをフィルタリング
  const filteredProjects = SAMPLE_PROJECTS.filter((project) => {
    // 検索クエリによるフィルタリング
    const matchesQuery = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // ステータスによるフィルタリング
    const matchesFilter = filter === 'all' || project.status === filter
    
    return matchesQuery && matchesFilter
  })

  const projectLimit = subscriptionInfo.isSubscribed ? Infinity : 3
  const canCreateMore = filteredProjects.length < projectLimit

  return (
    <DashboardShell>
      <DashboardHeader
        heading="プロジェクト"
        text="プロジェクトの管理と作成"
      >
        <Button asChild disabled={!canCreateMore}>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            新規プロジェクト
          </Link>
        </Button>
      </DashboardHeader>

      {/* フィルターと検索 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="プロジェクトを検索..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                <span>フィルター</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>ステータスでフィルター</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('all')}>
                すべて
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('active')}>
                アクティブ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('archived')}>
                アーカイブ済み
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>並び替え</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並び替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                名前（昇順）
              </DropdownMenuItem>
              <DropdownMenuItem>
                名前（降順）
              </DropdownMenuItem>
              <DropdownMenuItem>
                最終更新日（新しい順）
              </DropdownMenuItem>
              <DropdownMenuItem>
                最終更新日（古い順）
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">プロジェクトが見つかりません</h3>
          <p className="mt-2 text-center text-muted-foreground">
            検索条件に一致するプロジェクトがありません。<br />
            別の検索キーワードを試すか、新しいプロジェクトを作成してください。
          </p>
          <Button asChild className="mt-4" disabled={!canCreateMore}>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const Icon = project.icon
            return (
              <Card key={project.id} className={project.status === 'archived' ? 'opacity-70' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 rounded-full bg-muted p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">メニューを開く</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>オプション</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>
                            詳細を表示
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/edit`}>
                            <Settings className="mr-2 h-4 w-4" />
                            設定
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={project.status === 'archived' ? 'text-green-600' : 'text-destructive'}
                        >
                          {project.status === 'archived' ? '復元する' : 'アーカイブ'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">ユーザー: </span>
                      <span>{project.users}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">タイプ: </span>
                      <span>{project.type}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex w-full justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ja })}に更新
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        開く
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {!subscriptionInfo.isSubscribed && (
        <div className="mt-8">
          <Card className="bg-muted shadow-md">
            <CardHeader>
              <CardTitle>プロジェクト制限に達しました</CardTitle>
              <CardDescription>
                無料プランでは最大3つのプロジェクトを作成できます。さらに多くのプロジェクトを作成するにはプレミアムプランにアップグレードしてください。
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/pricing">
                  プレミアムにアップグレード
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </DashboardShell>
  )
}