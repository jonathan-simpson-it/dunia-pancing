import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function verifyWebhookToken(request: Request): boolean {
  const token = process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN
  if (!token) return true
  const callbackToken = request.headers.get('x-callback-token')
  return callbackToken === token
}

async function getOrderByExternalId(externalId: string) {
  return prisma.order.findUnique({ where: { id: externalId } })
}

async function isAlreadyProcessed(order: any, eventStatus: string, paymentId: string): Promise<boolean> {
  if (paymentId && order.paymentId === paymentId) return true
  if (eventStatus === 'PAID' || eventStatus === 'SETTLED' || eventStatus === 'CAPTURED') {
    if (order.status === 'paid') return true
  }
  if (eventStatus === 'EXPIRED') {
    if (order.status === 'cancelled') return true
  }
  return false
}

export async function POST(request: Request) {
  if (!verifyWebhookToken(request)) {
    console.warn('Xendit webhook: invalid callback token')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const event = body.event || ''
  const externalId = body.external_id || body.reference_id || ''
  const status = body.status || ''
  const paymentId = body.id || body.payment_id || ''

  if (!externalId) {
    return NextResponse.json({ error: 'Missing external_id' }, { status: 400 })
  }

  const order = await getOrderByExternalId(externalId)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (await isAlreadyProcessed(order, status, paymentId)) {
    return NextResponse.json({ success: true, dedup: true })
  }

  if (status === 'PAID' || status === 'SETTLED' || event === 'payment.capture') {
    await prisma.order.update({
      where: { id: externalId },
      data: {
        status: 'paid',
        paymentId,
        statusHistory: {
          create: {
            status: 'paid',
            note: `Pembayaran diterima via Xendit (${body.payment_channel || body.channel_code || body.payment_method || '-'})`,
          },
        },
      },
    })
  } else if (status === 'EXPIRED' || event === 'payment.expiry' || event === 'payment.failure') {
    const reason = status === 'EXPIRED' ? 'Pembayaran kadaluarsa' : 'Pembayaran gagal'
    await prisma.order.update({
      where: { id: externalId },
      data: {
        status: 'cancelled',
        cancelNote: reason,
        statusHistory: {
          create: {
            status: 'cancelled',
            note: `${reason} via Xendit`,
          },
        },
      },
    })
    const items = await prisma.orderItem.findMany({ where: { orderId: externalId } })
    for (const item of items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } },
        })
      }
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stockQty: { increment: item.qty } },
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}
