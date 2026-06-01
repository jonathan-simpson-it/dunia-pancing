import { NextResponse } from 'next/server'
import type { Prisma } from '.prisma/client'
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

  const variantTypes = body.variantTypes || []
  const variants = body.variants || []
  const hasVariants = variantTypes.length > 0

  const stockQty = hasVariants
    ? variants.reduce((sum: number, v: any) => sum + (v.stock_qty ?? v.stockQty ?? 0), 0)
    : (body.stockQty ?? 0)

  const inStock = hasVariants
    ? variants.some((v: any) => (v.stock_qty ?? v.stockQty ?? 0) > 0)
    : stockQty > 0

  const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const productId = body.id || undefined
    const created = await tx.product.create({
      data: {
        ...(productId ? { id: productId } : {}),
        nameId: body.nameId || body.name_id,
        nameEn: body.nameEn || body.name_en || body.nameId || body.name_id,
        slug: body.slug || (body.nameId || body.name_id || '').toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        descriptionId: body.descriptionId || body.description_id,
        descriptionEn: body.descriptionEn || body.description_en,
        priceIdr: body.priceIdr ?? body.price_idr ?? 0,
        originalPriceIdr: body.originalPriceIdr ?? body.original_price_idr ?? 0,
        stockQty,
        inStock,
        category: body.category || '',
        brand: body.brand || '',
        image: body.image || '',
        images: JSON.stringify(body.images || []),
        weight: body.weight || 0,
        specifications: JSON.stringify(body.specifications || []),
        keyFeatures: JSON.stringify(body.keyFeatures || []),
        features: JSON.stringify(body.features || []),
        location: body.location || 'Palembang',
        shippingEstimateMin: body.shippingEstimateMin ?? body.shippingEstimateDays?.min ?? 2,
        shippingEstimateMax: body.shippingEstimateMax ?? body.shippingEstimateDays?.max ?? 5,
        shopId,
      },
    })

    if (hasVariants) {
      for (const vt of variantTypes) {
        await tx.variantType.create({
          data: {
            id: vt.id,
            name: vt.name,
            productId: created.id,
            values: {
              create: (vt.values || []).map((vv: any) => ({
                id: vv.id,
                label: vv.label,
                metadata: vv.metadata ? JSON.stringify(vv.metadata) : undefined,
              })),
            },
          },
        })
      }

      for (const pv of variants) {
        await tx.productVariant.create({
          data: {
            id: pv.id,
            sku: pv.sku || '',
            combination: JSON.stringify(pv.combination || {}),
            priceIdr: pv.price_idr ?? pv.priceIdr ?? 0,
            originalPriceIdr: pv.original_price_idr ?? pv.originalPriceIdr,
            stockQty: pv.stock_qty ?? pv.stockQty ?? 0,
            weight: pv.weight ?? 0,
            image: pv.image || '',
            images: pv.images ? JSON.stringify(pv.images) : undefined,
            measurements: pv.measurements ? JSON.stringify(pv.measurements) : undefined,
            productId: created.id,
          },
        })
      }
    }

    return tx.product.findUnique({
      where: { id: created.id },
      include: {
        variantTypes: { include: { values: true } },
        productVariants: true,
      },
    })
  })

  return NextResponse.json(product, { status: 201 })
}
