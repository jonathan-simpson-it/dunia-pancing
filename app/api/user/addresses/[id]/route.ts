import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.userAddress.findFirst({
    where: { id, userId },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.userAddress.update({
    where: { id },
    data: {
      label: body.label ?? existing.label,
      name: body.name ?? existing.name,
      phone: body.phone ?? existing.phone,
      address: body.address ?? existing.address,
      city: body.city ?? existing.city,
      isDefault: body.isDefault ?? existing.isDefault,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.userAddress.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.userAddress.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
