import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const existingShop = await prisma.shop.findUnique({ where: { slug: 'dunia-pancing' } })
  if (existingShop) {
    console.log('Seed data already exists, skipping.')
    await prisma.$disconnect()
    return
  }

  const shop = await prisma.shop.create({
    data: {
      name: 'Dunia Pancing Palembang',
      slug: 'dunia-pancing',
      address: 'Jl. Kebon Jahe, Ilir Timur I, Palembang',
      phone: '081234567890',
    },
  })

  const hashedPassword = await bcrypt.hash('admin123', 12)
  const clientHashedPassword = await bcrypt.hash('client123', 12)

  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin Toko',
      role: 'admin',
      phone: '081234567890',
      shopId: shop.id,
    },
  })

  await prisma.user.create({
    data: {
      username: 'client',
      password: clientHashedPassword,
      name: 'Client User',
      role: 'client',
      phone: '081234567891',
      shopId: shop.id,
    },
  })

  const categories = [
    { key: 'reel', nameId: 'Reel', nameEn: 'Reel', icon: '🎣' },
    { key: 'rod', nameId: 'Joran', nameEn: 'Fishing Rod', icon: '🎯' },
    { key: 'line', nameId: 'Senar', nameEn: 'Fishing Line', icon: '〰️' },
    { key: 'lure', nameId: 'Umpan', nameEn: 'Lure & Bait', icon: '🦐' },
    { key: 'tool', nameId: 'Alat', nameEn: 'Tools', icon: '🔧' },
    { key: 'accessory', nameId: 'Aksesoris', nameEn: 'Accessories', icon: '🧢' },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: { ...cat, shopId: shop.id },
    })
  }

  console.log('Seed data created successfully.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
