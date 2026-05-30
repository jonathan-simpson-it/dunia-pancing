import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { code, subtotal, shopId } = body

  if (!code || !shopId) {
    return NextResponse.json({ valid: false, error: 'Missing fields' }, { status: 400 })
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code_shopId: { code: code.toUpperCase(), shopId } },
  })

  if (!voucher || !voucher.isActive) {
    return NextResponse.json({ valid: false, error: 'Kode voucher tidak valid' })
  }

  if (voucher.expiresAt && new Date() > voucher.expiresAt) {
    return NextResponse.json({ valid: false, error: 'Voucher sudah kadaluarsa' })
  }

  if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
    return NextResponse.json({ valid: false, error: 'Voucher sudah habis digunakan' })
  }

  if (voucher.minSpend && subtotal < voucher.minSpend) {
    return NextResponse.json({
      valid: false,
      error: `Min. belanja Rp${voucher.minSpend.toLocaleString('id-ID')}`,
    })
  }

  return NextResponse.json({
    valid: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
    },
  })
}
