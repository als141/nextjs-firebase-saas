import { cn } from '@/lib/utils'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full flex-col gap-2 px-4 py-6">
          <DashboardNav />
        </div>
      </aside>
      <main className="flex flex-col">
        <div className={cn('container flex-1 gap-8 p-4 md:p-8', className)}>
          {children}
        </div>
      </main>
    </div>
  )
}