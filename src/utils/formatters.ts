export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function discountPercent(original: number, current: number): number {
  if (original <= current) return 0
  return Math.round(((original - current) / original) * 100)
}

export function optimizePexelsUrl(url: string, width = 400, height = 300): string {
  if (!url || !url.includes('images.pexels.com')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('auto', 'compress')
    u.searchParams.set('cs', 'tinysrgb')
    u.searchParams.set('w', String(width))
    u.searchParams.set('h', String(height))
    u.searchParams.set('dpr', '1')
    u.searchParams.set('fit', 'crop')
    return u.toString()
  } catch {
    return url
  }
}
