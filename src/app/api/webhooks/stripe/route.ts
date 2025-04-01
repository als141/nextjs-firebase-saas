import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Stripe } from 'stripe'
import { stripe } from '@/lib/stripe/stripe'
import { adminDb, adminAuth } from '@/lib/firebase/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// Webhookシークレットキー
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    // Stripeイベントの検証
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error(`Webhook Error: ${error.message}`)
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

    console.log(`Webhook Event: ${event.type}`)

    // イベントタイプに基づいて処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.subscription && session.customer) {
          await handleCheckoutSessionCompleted(session)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handleInvoicePaymentSucceeded(invoice)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handleInvoicePaymentFailed(invoice)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// チェックアウトセッション完了時の処理
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // サブスクリプションを取得
    if (!session.subscription || !session.customer) return
    
    const subscriptionId = session.subscription.toString()
    const customerId = session.customer.toString()
    
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // ユーザーIDをサブスクリプションのメタデータから取得
    const userId = subscription.metadata.userId
    
    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }
    
    const priceId = subscription.items.data[0].price.id
    const productId = subscription.items.data[0].price.product.toString()
    
    // Firestoreにサブスクリプション情報を保存
    await adminDb.collection('users').doc(userId).update({
      stripeCustomerId: customerId,
      updatedAt: Timestamp.now(),
    })
    
    // サブスクリプション情報をFirestoreに保存
    await adminDb.collection('subscriptions').doc(subscriptionId).set({
      id: subscriptionId,
      userId,
      status: subscription.status,
      priceId,
      productId,
      currentPeriodStart: Timestamp.fromMillis(subscription.current_period_start * 1000),
      currentPeriodEnd: Timestamp.fromMillis(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: Timestamp.fromMillis(subscription.created * 1000),
      endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : null,
      canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
      trialStart: subscription.trial_start ? Timestamp.fromMillis(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? Timestamp.fromMillis(subscription.trial_end * 1000) : null,
      customerId,
    })
    
    console.log(`Subscription ${subscriptionId} saved for user ${userId}`)
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error)
  }
}

// サブスクリプション更新時の処理
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id
    const customerId = subscription.customer.toString()
    
    // ユーザーIDをサブスクリプションのメタデータから取得
    const userId = subscription.metadata.userId
    
    if (!userId) {
      // メタデータからユーザーIDが取得できない場合は、Firebaseから取得する
      const subscriptionDoc = await adminDb.collection('subscriptions').doc(subscriptionId).get()
      
      if (!subscriptionDoc.exists) {
        console.error(`Subscription ${subscriptionId} not found in Firestore`)
        return
      }
      
      const subscriptionData = subscriptionDoc.data()
      if (!subscriptionData?.userId) {
        console.error(`No userId found for subscription ${subscriptionId}`)
        return
      }
    }
    
    const priceId = subscription.items.data[0].price.id
    const productId = subscription.items.data[0].price.product.toString()
    
    // サブスクリプション情報をFirestoreに更新
    await adminDb.collection('subscriptions').doc(subscriptionId).update({
      status: subscription.status,
      priceId,
      productId,
      currentPeriodStart: Timestamp.fromMillis(subscription.current_period_start * 1000),
      currentPeriodEnd: Timestamp.fromMillis(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : null,
      canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : null,
      updatedAt: Timestamp.now(),
    })
    
    console.log(`Subscription ${subscriptionId} updated`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

// サブスクリプション削除時の処理
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const subscriptionId = subscription.id
    
    // サブスクリプション情報をFirestoreで更新
    await adminDb.collection('subscriptions').doc(subscriptionId).update({
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      endedAt: subscription.ended_at ? Timestamp.fromMillis(subscription.ended_at * 1000) : Timestamp.now(),
      canceledAt: subscription.canceled_at ? Timestamp.fromMillis(subscription.canceled_at * 1000) : Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    
    console.log(`Subscription ${subscriptionId} marked as deleted`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

// 請求書支払い成功時の処理
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return
    
    const subscriptionId = invoice.subscription.toString()
    
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // サブスクリプションのステータスを更新
    await adminDb.collection('subscriptions').doc(subscriptionId).update({
      status: subscription.status,
      currentPeriodStart: Timestamp.fromMillis(subscription.current_period_start * 1000),
      currentPeriodEnd: Timestamp.fromMillis(subscription.current_period_end * 1000),
      updatedAt: Timestamp.now(),
    })
    
    // 請求書情報を保存
    await adminDb.collection('invoices').doc(invoice.id).set({
      id: invoice.id,
      customerId: invoice.customer?.toString(),
      subscriptionId,
      status: invoice.status,
      total: invoice.total,
      subtotal: invoice.subtotal,
      currency: invoice.currency,
      periodStart: invoice.period_start ? Timestamp.fromMillis(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? Timestamp.fromMillis(invoice.period_end * 1000) : null,
      created: Timestamp.fromMillis(invoice.created * 1000),
    })
    
    console.log(`Invoice ${invoice.id} payment succeeded for subscription ${subscriptionId}`)
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

// 請求書支払い失敗時の処理
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return
    
    const subscriptionId = invoice.subscription.toString()
    
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // サブスクリプションのステータスを更新
    await adminDb.collection('subscriptions').doc(subscriptionId).update({
      status: subscription.status,
      updatedAt: Timestamp.now(),
    })
    
    // 請求書情報を保存
    await adminDb.collection('invoices').doc(invoice.id).set({
      id: invoice.id,
      customerId: invoice.customer?.toString(),
      subscriptionId,
      status: invoice.status,
      total: invoice.total,
      subtotal: invoice.subtotal,
      currency: invoice.currency,
      periodStart: invoice.period_start ? Timestamp.fromMillis(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? Timestamp.fromMillis(invoice.period_end * 1000) : null,
      created: Timestamp.fromMillis(invoice.created * 1000),
      failureMessage: invoice.last_payment_error?.message,
    })
    
    console.log(`Invoice ${invoice.id} payment failed for subscription ${subscriptionId}`)
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}