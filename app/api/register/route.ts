import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password, name, phone } = body

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
  }

  const defaultShop = await prisma.shop.findUnique({ where: { slug: 'dunia-pancing' } })
  if (!defaultShop) {
    return NextResponse.json({ error: 'No shop configured' }, { status: 500 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name: name || username,
      phone,
      role: 'client',
      shopId: defaultShop.id,
    },
  })

  return NextResponse.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  }, { status: 201 })
}
