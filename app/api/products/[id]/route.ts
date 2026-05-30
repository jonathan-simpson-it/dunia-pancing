import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variantTypes: { include: { values: true } },
      productVariants: true,
      sizeChartEntries: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const product = await prisma.product.update({
    where: { id },
    data: {
      nameId: body.nameId,
      nameEn: body.nameEn,
      slug: body.slug,
      descriptionId: body.descriptionId,
      descriptionEn: body.descriptionEn,
      priceIdr: body.priceIdr,
      originalPriceIdr: body.originalPriceIdr,
      stockQty: body.stockQty,
      inStock: body.inStock,
      category: body.category,
      brand: body.brand,
      image: body.image,
      images: body.images ? JSON.stringify(body.images) : undefined,
      weight: body.weight,
      soldCount: body.soldCount,
      specifications: body.specifications ? JSON.stringify(body.specifications) : undefined,
      keyFeatures: body.keyFeatures ? JSON.stringify(body.keyFeatures) : undefined,
      features: body.features ? JSON.stringify(body.features) : undefined,
      location: body.location,
    },
    include: {
      variantTypes: { include: { values: true } },
      productVariants: true,
    },
  })

  return NextResponse.json(product)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
