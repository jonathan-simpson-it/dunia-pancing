import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const reviews = await prisma.review.findMany({
    where: { productId: id, isApproved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reviews)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  const body = await request.json()

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: 'Rating harus 1-5' }, { status: 400 })
  }

  const review = await prisma.review.create({
    data: {
      rating: body.rating,
      text: body.text || '',
      productId: id,
      userId: session?.user?.id || null,
      isApproved: !session, // auto-approve for now
    },
  })

  return NextResponse.json(review, { status: 201 })
}
