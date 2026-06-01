import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = (session.user as any).shopId
  const { key } = await params
  const body = await request.json()

  const existing = await prisma.category.findFirst({ where: { key, shopId } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const updated = await prisma.category.update({
    where: { id: existing.id },
    data: {
      nameId: body.nameId ?? existing.nameId,
      nameEn: body.nameEn ?? existing.nameEn,
      icon: body.icon ?? existing.icon,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const shopId = (session.user as any).shopId
  const { key } = await params

  const existing = await prisma.category.findFirst({ where: { key, shopId } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const used = await prisma.product.count({ where: { category: key } })
  if (used > 0) {
    return NextResponse.json({ error: 'Category has existing products' }, { status: 409 })
  }

  await prisma.category.delete({ where: { id: existing.id } })

  return NextResponse.json({ success: true })
}
