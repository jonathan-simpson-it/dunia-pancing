import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const shopId = (session?.user as any)?.shopId

  if (!shopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vouchers = await prisma.voucher.findMany({
    where: { shopId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(vouchers)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = (session.user as any).shopId
  const body = await request.json()

  const voucher = await prisma.voucher.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      value: parseFloat(body.value),
      minSpend: body.minSpend ? parseFloat(body.minSpend) : null,
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      shopId,
    },
  })

  return NextResponse.json(voucher, { status: 201 })
}
