import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const AUTO_REPLIES: Record<string, { keywords: string[]; reply: string }[]> = {
  id: [
    { keywords: ['stok', 'tersedia', 'barang', 'ready'], reply: 'Untuk info stok terkini, silakan cek halaman produk. Ada produk tertentu yang ingin ditanyakan? Sebutkan namanya ya!' },
    { keywords: ['harga', 'mahal', 'murah', 'diskon', 'promo'], reply: 'Harga sudah tercantum di katalog. Ada diskon khusus pembelian grosir. Hubungi admin untuk info lebih lanjut.' },
    { keywords: ['kirim', 'ongkir', 'pengiriman', 'sampai', 'lama', 'cod'], reply: 'Kami kirim ke seluruh Indonesia via JNE, J&T, dan SiCepat. Bisa COD untuk area Palembang. Estimasi 2-5 hari kerja.' },
    { keywords: ['bayar', 'transfer', 'pembayaran', 'payment', 'bca', 'bri'], reply: 'Pembayaran via transfer Bank BCA, BRI, Mandiri, atau COD. Detail rekening ada di halaman checkout.' },
    { keywords: ['garansi', 'retur', 'tukar', 'kembali', 'rusak'], reply: 'Garansi 30 hari untuk setiap produk. Jika ada kerusakan, hubungi kami dengan foto/video sebagai bukti.' },
    { keywords: ['warna', 'ukuran', 'pilihan', 'variasi'], reply: 'Pilihan warna/ukuran bisa dicek di halaman produk. Klik varian yang tersedia untuk melihat stok.' },
    { keywords: ['test', 'coba', 'halo', 'hai', 'hello', 'hi', 'pagi', 'siang', 'malam'], reply: 'Halo! Ada yang bisa kami bantu? Silakan tanyakan tentang produk atau pemesanan.' },
  ],
  en: [
    { keywords: ['stock', 'available', 'ready'], reply: 'For latest stock info, please check the product page. Any specific product you\'d like to ask about?' },
    { keywords: ['price', 'expensive', 'cheap', 'discount', 'promo'], reply: 'Prices are listed in our catalog. We have special discounts for wholesale purchases. Contact admin for details.' },
    { keywords: ['ship', 'shipping', 'delivery', 'arrive', 'cod'], reply: 'We ship nationwide via JNE, J&T, and SiCepat. COD available for Palembang area. Estimated 2-5 business days.' },
    { keywords: ['pay', 'transfer', 'payment', 'bank'], reply: 'Payment via BCA, BRI, Mandiri bank transfer, or COD. Account details are on the checkout page.' },
    { keywords: ['warranty', 'return', 'exchange', 'broken', 'damage'], reply: '30-day warranty on all products. For damages, contact us with photo/video proof.' },
    { keywords: ['color', 'size', 'option', 'variant'], reply: 'Color/size options are on the product page. Click available variants to check stock.' },
    { keywords: ['test', 'hello', 'hi', 'morning', 'afternoon'], reply: 'Hello! How can we help you? Feel free to ask about our products or ordering process.' },
  ],
}

function findReply(text: string, lang: string): string | null {
  const lower = text.toLowerCase()
  const replies = AUTO_REPLIES[lang] || AUTO_REPLIES.id
  for (const entry of replies) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.reply
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { sessionId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conversation) {
    return NextResponse.json({ messages: [] })
  }

  return NextResponse.json({ conversationId: conversation.id, messages: conversation.messages })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { text, sessionId, name, phone, lang } = body

  if (!text || !sessionId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const shop = await prisma.shop.findFirst()
  if (!shop) {
    return NextResponse.json({ error: 'No shop configured' }, { status: 500 })
  }

  let conversation = await prisma.conversation.findUnique({
    where: { sessionId },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        sessionId,
        customerName: name || null,
        customerPhone: phone || null,
        shopId: shop.id,
      },
    })
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })
  }

  await prisma.chatMessage.create({
    data: {
      text: text.trim(),
      sender: 'user',
      conversationId: conversation.id,
    },
  })

  const autoReply = findReply(text.trim(), lang || 'id')
  if (autoReply) {
    await prisma.chatMessage.create({
      data: {
        text: autoReply,
        sender: 'admin',
        conversationId: conversation.id,
      },
    })
  }

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ conversationId: conversation.id, messages }, { status: 201 })
}
