import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const reviews = await prisma.review.findMany({
    where: { productId: id, isApproved: true },
    include: { user: { select: { name: true, id: true } } },
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

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Harus login dulu' }, { status: 401 })
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: id,
      order: { userId: session.user.id },
    },
  })

  if (!purchased) {
    return NextResponse.json({ error: 'Kamu harus membeli produk ini dulu untuk memberi review' }, { status: 403 })
  }

  const existing = await prisma.review.findFirst({
    where: { productId: id, userId: session.user.id },
  })

  if (existing) {
    return NextResponse.json({ error: 'Kamu sudah pernah memberi review produk ini' }, { status: 409 })
  }

  const images = Array.isArray(body.images)
    ? body.images.slice(0, 3).filter((url: string) => {
        if (typeof url !== 'string') return false
        return url.startsWith('data:image/') || url.startsWith('http')
      })
    : []

  const review = await prisma.review.create({
    data: {
      rating: body.rating,
      text: body.text || '',
      images: JSON.stringify(images),
      productId: id,
      userId: session.user.id,
      isApproved: true,
    },
  })

  const aggregate = await prisma.review.aggregate({
    where: { productId: id, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await prisma.product.update({
    where: { id },
    data: { rating: aggregate._avg.rating ?? 0 },
  })

  return NextResponse.json(review, { status: 201 })
}
