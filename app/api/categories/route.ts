import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId

  const where = shopId ? { shopId } : { shop: { slug: 'dunia-pancing' } }
  const categories = await prisma.category.findMany({ where, orderBy: { nameId: 'asc' } })

  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = (session.user as any).shopId
  const body = await request.json()

  const category = await prisma.category.create({
    data: {
      key: body.key,
      nameId: body.nameId,
      nameEn: body.nameEn || body.nameId,
      icon: body.icon,
      shopId,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
