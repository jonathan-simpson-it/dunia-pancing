import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  await prisma.chatMessage.updateMany({
    where: { conversationId: id, sender: 'user', read: false },
    data: { read: true },
  })

  return NextResponse.json({
    id: conversation.id,
    customerName: conversation.customerName,
    customerPhone: conversation.customerPhone,
    messages: conversation.messages,
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    if (!body.text) {
      return NextResponse.json({ error: 'Message text required' }, { status: 400 })
    }

    await prisma.conversation.update({
      where: { id },
      data: {},
    })

    const message = await prisma.chatMessage.create({
      data: {
        text: body.text.trim(),
        sender: 'admin',
        read: true,
        conversationId: id,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error: any) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 })
  }
}
