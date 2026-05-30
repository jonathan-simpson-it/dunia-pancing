const DEFAULT_PHONE = '6281234567890'
let cachedPhone = ''

export async function getShopPhone(): Promise<string> {
  if (cachedPhone) return cachedPhone
  try {
    const res = await fetch('/api/shop')
    if (res.ok) {
      const shop = await res.json()
      cachedPhone = shop.phone?.replace(/^0/, '62').replace(/\D/g, '') || DEFAULT_PHONE
      return cachedPhone
    }
  } catch {}
  return DEFAULT_PHONE
}
