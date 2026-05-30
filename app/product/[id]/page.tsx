import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import ProductDetailPage from '@/views/ProductDetail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  try {
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product) {
      return { title: 'Produk Tidak Ditemukan' }
    }

    return {
      title: product.nameId,
      description: product.descriptionId?.slice(0, 160) || `Beli ${product.nameId} harga terbaik`,
      openGraph: {
        title: product.nameId,
        description: product.descriptionId?.slice(0, 160) || undefined,
        type: 'website',
        images: product.image ? [{ url: product.image }] : undefined,
      },
    }
  } catch {
    return { title: 'Detail Produk' }
  }
}

export default function Page() {
  return <ProductDetailPage />
}
