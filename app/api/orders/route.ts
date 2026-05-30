import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: any = shopId ? { shopId } : { shop: { slug: 'dunia-pancing' } }

  if (status && status !== 'all') {
    where.status = status
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
      { awbNumber: { contains: search } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)

  const counter = await prisma.order.count()
  const seq = String(counter + 1).padStart(3, '0')
  const orderNumber = `DP-${dd}${mm}${yy}-${seq}`

  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: 'waiting_payment',
      customerName: body.customer.name,
      customerPhone: body.customer.phone,
      customerAddress: body.customer.address,
      customerCity: body.customer.city,
      customerNote: body.customer.notes,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      shippingFee: body.shipping?.fee || 0,
      shippingLabel: body.shipping?.label || '',
      total: body.total || (body.subtotal + (body.shipping?.fee || 0) - (body.discount || 0)),
      paymentMethod: body.payment?.label || '',
      paymentType: body.payment?.type || '',
      paymentBank: body.payment?.bank || '',
      shopId: body.shopId || (await getDefaultShopId()),
      items: {
        create: body.items.map((item: any) => ({
          nameId: item.name_id || item.nameId,
          nameEn: item.name_en || item.nameEn,
          image: item.image || '',
          priceIdr: item.price_idr ?? item.priceIdr,
          qty: item.qty,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
        })),
      },
      statusHistory: {
        create: {
          status: 'waiting_payment',
          timestamp: now,
        },
      },
    },
    include: {
      items: true,
      statusHistory: true,
    },
  })

  for (const item of body.items) {
    const productId = item.productId
    if (!productId) continue

    try {
      await prisma.product.update({
        where: { id: productId },
        data: {
          stockQty: { decrement: item.qty },
          soldCount: { increment: item.qty },
        },
      })
    } catch {
      // product may not exist in DB — skip
    }

    if (item.variantId) {
      try {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQty: { decrement: item.qty },
          },
        })
      } catch {
        // variant may not exist — skip
      }
    }
  }

  return NextResponse.json(order, { status: 201 })
}

async function getDefaultShopId(): Promise<string> {
  const shop = await prisma.shop.findUnique({ where: { slug: 'dunia-pancing' } })
  return shop!.id
}
