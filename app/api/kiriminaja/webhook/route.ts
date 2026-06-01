import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const API_KEY = process.env.KIRIMINAJA_API_KEY || ''

function verifyAuth(request: Request): boolean {
  if (!API_KEY) return true
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${API_KEY}`
}

export async function POST(request: Request) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const method = body.method || ''
  const data = body.data || []

  for (const item of data) {
    const orderId = item.order_id || ''
    const awb = item.awb || ''
    if (!orderId) continue

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) continue

    if (method === 'processed_packages' && awb) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          awbNumber: awb,
          statusHistory: {
            create: { status: 'shipping', note: `AWB: ${awb} via KiriminAja` },
          },
        },
      })
    } else if (method === 'shipped_packages') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          shippedAt: item.shipped_at || new Date().toISOString(),
          statusHistory: {
            create: { status: 'shipping', note: 'Paket dijemput kurir' },
          },
        },
      })
    } else if (method === 'finished_packages') {
      const isCOD = order.paymentType === 'cod'
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: isCOD ? 'completed' : 'completed',
          deliveredAt: item.finished_at || new Date().toISOString(),
          ...(isCOD ? {
            statusHistory: {
              create: [
                { status: 'paid', note: 'COD dibayar saat pengiriman via KiriminAja' },
                { status: 'completed', note: 'Pesanan selesai (COD)' },
              ],
            },
          } : {
            statusHistory: {
              create: { status: 'completed', note: 'Pesanan selesai' },
            },
          }),
        },
      })
    } else if (method === 'canceled_packages' || method === 'returned_packages') {
      const reason = method === 'canceled_packages' ? 'Pengiriman dibatalkan' : 'Paket dikembalikan'
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          cancelNote: reason,
          statusHistory: {
            create: { status: 'cancelled', note: `${reason} via KiriminAja` },
          },
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}
