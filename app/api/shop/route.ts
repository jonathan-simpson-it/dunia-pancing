import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId

  const shop = await prisma.shop.findUnique({
    where: shopId ? { id: shopId } : { slug: 'dunia-pancing' },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      logo: true,
    },
  })

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  return NextResponse.json(shop)
}
