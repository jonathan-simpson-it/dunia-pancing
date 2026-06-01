import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const addresses = await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(request: Request) {
  const session = await auth()
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.userAddress.create({
    data: {
      label: body.label || (body.isDefault ? 'Utama' : 'Lainnya'),
      name: body.name,
      phone: body.phone,
      address: body.address,
      city: body.city || 'Palembang',
      isDefault: body.isDefault || false,
      userId,
    },
  })

  return NextResponse.json(address, { status: 201 })
}
