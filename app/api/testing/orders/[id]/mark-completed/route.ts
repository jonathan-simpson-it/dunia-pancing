import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NEXT_PUBLIC_TESTING_MODE !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Harus login dulu' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'completed',
      statusHistory: {
        create: {
          status: 'completed',
          note: 'Marked completed via testing shortcut',
        },
      },
    },
    include: {
      items: true,
      statusHistory: { orderBy: { timestamp: 'desc' } },
    },
  })

  return NextResponse.json(updated)
}
