import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createXenditRefund } from '@/lib/xendit'

export async function POST(request: Request) {
  const body = await request.json()
  const { orderId, paymentId, amount, reason } = body

  if (!orderId || !paymentId || !amount) {
    return NextResponse.json({ error: 'Missing fields: orderId, paymentId, amount' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    const refund = await createXenditRefund({ paymentId, amount, reason })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        cancelNote: reason || 'Refund via Xendit',
        statusHistory: {
          create: {
            status: 'cancelled',
            note: `Refund ${amount} via Xendit (${refund.id})`,
          },
        },
      },
    })

    return NextResponse.json({ success: true, refund })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Refund failed' },
      { status: 500 },
    )
  }
}
