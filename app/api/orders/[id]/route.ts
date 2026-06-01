import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
      ],
    },
    include: {
      items: true,
      statusHistory: { orderBy: { timestamp: 'desc' } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
      ],
    },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updateData: any = {}
  const historyCreate: any[] = []

  if (body.status) {
    updateData.status = body.status
    historyCreate.push({
      status: body.status,
      note: body.note || '',
    })
  }

  if (body.courier) updateData.courier = body.courier
  if (body.courierLabel) updateData.courierLabel = body.courierLabel
  if (body.awbNumber) updateData.awbNumber = body.awbNumber
  if (body.cancelNote) updateData.cancelNote = body.cancelNote

  const order = await prisma.order.update({
    where: { id: existing.id },
    data: {
      ...updateData,
      statusHistory: historyCreate.length > 0
        ? { create: historyCreate }
        : undefined,
    },
    include: {
      items: true,
      statusHistory: { orderBy: { timestamp: 'desc' } },
    },
  })

  if (body.status === 'cancelled') {
    const items = order.items.length > 0
      ? order.items
      : await prisma.orderItem.findMany({ where: { orderId: existing.id } })
    for (const item of items) {
      const productId = item.productId
      if (productId) {
        await prisma.product.update({
          where: { id: productId },
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

  return NextResponse.json(order)
}
