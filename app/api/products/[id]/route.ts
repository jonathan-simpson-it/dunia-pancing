import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
    if (hasVariants) {
      await tx.productVariant.deleteMany({ where: { productId: id } })
      await tx.variantValue.deleteMany({ where: { variantType: { productId: id } } })
      await tx.variantType.deleteMany({ where: { productId: id } })

      for (const vt of variantTypes) {
        await tx.variantType.create({
          data: {
            id: vt.id,
            name: vt.name,
            productId: id,
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
            productId: id,
          },
        })
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        nameId: body.nameId,
        nameEn: body.nameEn,
        slug: body.slug,
        descriptionId: body.descriptionId,
        descriptionEn: body.descriptionEn,
        priceIdr: body.priceIdr,
        originalPriceIdr: body.originalPriceIdr,
        stockQty,
        inStock,
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
