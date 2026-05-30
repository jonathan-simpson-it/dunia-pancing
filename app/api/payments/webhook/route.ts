import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()

  const externalId = body.external_id
  const status = body.status

  if (!externalId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: externalId },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (status === 'PAID' || status === 'SETTLED') {
    await prisma.order.update({
      where: { id: externalId },
      data: {
        status: 'paid',
        paymentId: body.id || '',
        statusHistory: {
          create: {
            status: 'paid',
            note: `Pembayaran diterima via Xendit (${body.payment_channel || body.payment_method || '-'})`,
          },
        },
      },
    })
  } else if (status === 'EXPIRED') {
    await prisma.order.update({
      where: { id: externalId },
      data: {
        status: 'cancelled',
        cancelNote: 'Pembayaran kadaluarsa',
        statusHistory: {
          create: {
            status: 'cancelled',
            note: 'Pembayaran kadaluarsa via Xendit',
          },
        },
      },
    })
  }

  return NextResponse.json({ success: true })
}
