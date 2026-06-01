import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { shopId },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { messages: { where: { sender: 'user', read: false } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(
    conversations.map((c: any) => ({
      id: c.id,
      sessionId: c.sessionId,
      customerName: c.customerName,
      customerPhone: c.customerPhone,
      lastMessage: c.messages[0] || null,
      unread: c._count.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
  )
}
