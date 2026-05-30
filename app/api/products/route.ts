import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId

  const where = shopId ? { shopId } : { shop: { slug: 'dunia-pancing' } }

  const products = await prisma.product.findMany({
    where,
    include: {
      variantTypes: { include: { values: true } },
      productVariants: true,
      sizeChartEntries: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = (session.user as any).shopId
  const body = await request.json()

  const product = await prisma.product.create({
    data: {
      nameId: body.nameId,
      nameEn: body.nameEn || body.nameId,
      slug: body.slug || body.nameId.toLowerCase().replace(/\s+/g, '-'),
      descriptionId: body.descriptionId,
      descriptionEn: body.descriptionEn,
      priceIdr: body.priceIdr,
      originalPriceIdr: body.originalPriceIdr,
      stockQty: body.stockQty ?? 0,
      inStock: body.inStock ?? true,
      category: body.category || '',
      brand: body.brand || '',
      image: body.image || '',
      images: JSON.stringify(body.images || []),
      weight: body.weight || 0,
      specifications: JSON.stringify(body.specifications || []),
      keyFeatures: JSON.stringify(body.keyFeatures || []),
      features: JSON.stringify(body.features || []),
      location: body.location || '',
      shippingEstimateMin: body.shippingEstimateMin ?? 2,
      shippingEstimateMax: body.shippingEstimateMax ?? 5,
      shopId,
    },
    include: {
      variantTypes: { include: { values: true } },
      productVariants: true,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
