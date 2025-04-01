import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

// クラス名をマージするユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 価格をフォーマットするユーティリティ
export function formatPrice(price: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(price)
}

// 日付をフォーマットするユーティリティ
export function formatDate(date: Date | string | number, formatStr: string = 'yyyy年MM月dd日') {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date:', date)
    return ''
  }
  
  return format(dateObj, formatStr, { locale: ja })
}

// サブスクリプションのステータスを日本語に変換するユーティリティ
export function translateSubscriptionStatus(status: string) {
  const statusMap: Record<string, string> = {
    active: 'アクティブ',
    canceled: 'キャンセル済み',
    incomplete: '未完了',
    incomplete_expired: '期限切れ',
    past_due: '支払い期限超過',
    trialing: '試用期間中',
    unpaid: '未払い',
  }
  
  return statusMap[status] || status
}

// ユーザーの表示名を取得するユーティリティ
export function getUserDisplayName(user: any) {
  if (!user) return 'ゲスト'
  
  if (user.displayName) return user.displayName
  
  if (user.email) {
    // メールアドレスからユーザー名部分を抽出
    const emailName = user.email.split('@')[0]
    return emailName
  }
  
  return 'ユーザー'
}