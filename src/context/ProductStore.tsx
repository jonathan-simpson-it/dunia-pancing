import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Product, Category, PriceUpdate, ImportResult, ProductVariant, VariantType, ProductFeature } from '../types'
import seed from '../data/seed.json'

interface ProductContextValue {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  importPrices: (priceUpdates: PriceUpdate[]) => ImportResult[]
  getProduct: (id: string) => Product | null
  nextId: () => string
  categories: Category[]
  addCategory: (data: { key: string; name_id: string; name_en: string; icon: string }) => boolean
  renameCategory: (key: string, data: { name_id?: string; name_en?: string; icon?: string }) => void
  deleteCategory: (key: string) => boolean
  getCategoryName: (key: string, lang: 'id' | 'en') => string
  categoryKeys: Record<string, string>
  loaded: boolean
  getActiveVariant: (productId: string, combination: Record<string, string>) => ProductVariant | null
  addVariantType: (productId: string, variantType: VariantType) => void
  updateVariantType: (productId: string, typeId: string, updates: Partial<VariantType>) => void
  removeVariantType: (productId: string, typeId: string) => void
  addVariantValue: (productId: string, typeId: string, value: VariantType['values'][0]) => void
  updateVariantValue: (productId: string, typeId: string, valueId: string, updates: Partial<VariantType['values'][0]>) => void
  removeVariantValue: (productId: string, typeId: string, valueId: string) => void
  updateVariant: (productId: string, variantId: string, updates: Partial<ProductVariant>) => void
  addFeature: (productId: string, feature: ProductFeature) => void
  removeFeature: (productId: string, featureId: string) => void
  getWishlist: (username: string) => string[]
  toggleWishlist: (username: string, productId: string) => boolean
}

const ProductContext = createContext<ProductContextValue>(null!)
const PRODUCTS_KEY = 'dunia-pancing-products'
const CATEGORIES_KEY = 'dunia-pancing-categories'

const DEFAULT_CATEGORIES: Category[] = [
  { key: 'rods', name_id: 'Joran', name_en: 'Rods', icon: '🎣' },
  { key: 'reels', name_id: 'Reel', name_en: 'Reels', icon: '🔄' },
  { key: 'lines', name_id: 'Senar', name_en: 'Lines', icon: '〰️' },
  { key: 'hooks', name_id: 'Kail', name_en: 'Hooks', icon: '🪝' },
  { key: 'lures', name_id: 'Umpan', name_en: 'Lures', icon: '🐟' },
  { key: 'accessories', name_id: 'Aksesoris', name_en: 'Accessories', icon: '🧰' },
]

function migrateProduct(p: any): Product {
  return {
    ...p,
    variantTypes: p.variantTypes || [],
    variants: p.variants || [],
    features: p.features || [],
    wishlistCount: p.wishlistCount || 0,
    shippingEstimateDays: p.shippingEstimateDays || { min: 3, max: 7 },
    sizeChart: p.sizeChart || [],
  }
}

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) return JSON.parse(raw).map(migrateProduct)
  } catch { /* noop */ }
  const seeded = (seed as any[]).map(migrateProduct)
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seeded))
  return seeded as Product[]
}

function apiProductToLocal(p: any): Product {
  return migrateProduct({
    id: p.id,
    name_id: p.nameId,
    name_en: p.nameEn || p.nameId,
    category: p.category || '',
    brand: p.brand || '',
    specifications: (() => { try { return JSON.parse(p.specifications || '[]') } catch { return [] } })(),
    price_idr: p.priceIdr,
    original_price_idr: p.originalPriceIdr || 0,
    stock_qty: p.stockQty,
    weight: p.weight || 0,
    in_stock: p.inStock,
    sold_count: p.soldCount,
    rating: p.rating,
    location: p.location || '',
    image: p.image || '',
    images: (() => { try { return JSON.parse(p.images || '[]') } catch { return [] } })(),
    description_id: p.descriptionId || '',
    description_en: p.descriptionEn || '',
    key_features: (() => { try { return JSON.parse(p.keyFeatures || '[]') } catch { return [] } })(),
    features: (() => { try { return JSON.parse(p.features || '[]') } catch { return [] } })(),
    variantTypes: p.variantTypes || [],
    variants: (p.productVariants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku || '',
      combination: typeof v.combination === 'string' ? JSON.parse(v.combination) : (v.combination || {}),
      price_idr: v.priceIdr ?? v.price_idr ?? 0,
      original_price_idr: v.originalPriceIdr ?? v.original_price_idr,
      stock_qty: v.stockQty ?? v.stock_qty ?? 0,
      weight: v.weight ?? 0,
      image: v.image || '',
    })),
    wishlistCount: p.wishlistCount || 0,
    shippingEstimateDays: {
      min: p.shippingEstimateMin || 2,
      max: p.shippingEstimateMax || 5,
    },
    sizeChart: (p.sizeChartEntries || []).map((e: any) => ({
      label: e.label,
      value: e.value,
    })),
  })
}

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* noop */ }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES))
  return DEFAULT_CATEGORIES
}

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = loadProducts()
    setProducts(stored)
    setCategories(loadCategories())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    fetch('/api/products')
      .then(r => r.ok ? r.json() : [])
      .then((apiProducts: any[]) => {
        if (!apiProducts || apiProducts.length === 0) return
        const seedIds = new Set((seed as any[]).map(p => p.id))
        const apiEntries: [string, Product][] = apiProducts.map((p: any) => [p.id, apiProductToLocal(p)])
        const apiIds = new Set(apiEntries.map(e => e[0]))
        const apiMap = new Map(apiEntries)
        setProducts(prev => {
          const next: Product[] = []
          for (const p of prev) {
            if (apiMap.has(p.id) || seedIds.has(p.id)) {
              next.push(apiMap.has(p.id) ? apiMap.get(p.id)! : p)
            }
          }
          const newOnes: Product[] = []
          for (const [id, p] of apiEntries) {
            if (!prev.some(x => x.id === id)) newOnes.push(p)
          }
          if (newOnes.length === 0 && next.length === prev.length &&
              next.every((p, i) => p === prev[i])) return prev
          return [...newOnes, ...next]
        })
      })
      .catch(() => {})
  }, [loaded])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    }
  }, [products, loaded])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
    }
  }, [categories, loaded])

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [product, ...prev])
  }, [])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === id)
      if (exists) return prev.map(p => p.id === id ? { ...p, ...updates } : p)
      return [{ ...updates, id } as Product, ...prev]
    })
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const importPrices = useCallback((priceUpdates: PriceUpdate[]): ImportResult[] => {
    const updated: ImportResult[] = []
    setProducts(prev => {
      const next = prev.map(p => {
        const match = priceUpdates.find(u =>
          u.id === p.id || p.name_id.toLowerCase().includes((u.name || '').toLowerCase())
        )
        if (match && match.price_idr && match.price_idr !== p.price_idr) {
          updated.push({ id: p.id, name: p.name_id, old: p.price_idr, new: match.price_idr })
          return { ...p, price_idr: match.price_idr }
        }
        return p
      })
      return next
    })
    return updated
  }, [])

  const getProduct = useCallback((id: string): Product | null => {
    return products.find(p => p.id === id) || null
  }, [products])

  const nextId = useCallback((): string => {
    return 'dp-' + Date.now().toString(36)
  }, [])

  const addCategory = useCallback(({ key, name_id, name_en, icon }: { key: string; name_id: string; name_en: string; icon: string }): boolean => {
    const exists = categories.some(c => c.key === key)
    if (exists) return false
    const cat: Category = { key, name_id, name_en: name_en || name_id, icon: icon || '📦' }
    setCategories(prev => [...prev, cat])
    return true
  }, [categories])

  const renameCategory = useCallback((key: string, { name_id, name_en, icon }: { name_id?: string; name_en?: string; icon?: string }) => {
    setCategories(prev => prev.map(c =>
      c.key === key ? { ...c, name_id: name_id || c.name_id, name_en: name_en || c.name_en, icon: icon || c.icon } : c
    ))
  }, [])

  const deleteCategory = useCallback((key: string): boolean => {
    const used = products.some(p => p.category === key)
    if (used) return false
    setCategories(prev => prev.filter(c => c.key !== key))
    return true
  }, [products])

  const getCategoryName = useCallback((key: string, lang: 'id' | 'en'): string => {
    const cat = categories.find(c => c.key === key)
    if (!cat) return key
    return lang === 'id' ? cat.name_id : cat.name_en
  }, [categories])

  const categoryKeys = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach(c => { map[c.key] = c.key })
    return map
  }, [categories])

  const getActiveVariant = useCallback((productId: string, combination: Record<string, string>): ProductVariant | null => {
    const product = products.find(p => p.id === productId)
    if (!product || !product.variants) return null
    return product.variants.find(v =>
      Object.entries(combination).every(([key, val]) => v.combination[key] === val)
    ) || null
  }, [products])

  const addVariantType = useCallback((productId: string, variantType: VariantType) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, variantTypes: [...(p.variantTypes || []), variantType] }
        : p
    ))
  }, [])

  const updateVariantType = useCallback((productId: string, typeId: string, updates: Partial<VariantType>) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, variantTypes: (p.variantTypes || []).map(vt => vt.id === typeId ? { ...vt, ...updates } : vt) }
        : p
    ))
  }, [])

  const removeVariantType = useCallback((productId: string, typeId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, variantTypes: (p.variantTypes || []).filter(vt => vt.id !== typeId) }
        : p
    ))
  }, [])

  const addVariantValue = useCallback((productId: string, typeId: string, value: VariantType['values'][0]) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? {
            ...p,
            variantTypes: (p.variantTypes || []).map(vt =>
              vt.id === typeId ? { ...vt, values: [...vt.values, value] } : vt
            )
          }
        : p
    ))
  }, [])

  const updateVariantValue = useCallback((productId: string, typeId: string, valueId: string, updates: Partial<VariantType['values'][0]>) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? {
            ...p,
            variantTypes: (p.variantTypes || []).map(vt =>
              vt.id === typeId
                ? { ...vt, values: vt.values.map(v => v.id === valueId ? { ...v, ...updates } : v) }
                : vt
            )
          }
        : p
    ))
  }, [])

  const removeVariantValue = useCallback((productId: string, typeId: string, valueId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? {
            ...p,
            variantTypes: (p.variantTypes || []).map(vt =>
              vt.id === typeId
                ? { ...vt, values: vt.values.filter(v => v.id !== valueId) }
                : vt
            )
          }
        : p
    ))
  }, [])

  const updateVariant = useCallback((productId: string, variantId: string, updates: Partial<ProductVariant>) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? {
            ...p,
            variants: (p.variants || []).map(v =>
              v.id === variantId ? { ...v, ...updates } : v
            )
          }
        : p
    ))
  }, [])

  const addFeature = useCallback((productId: string, feature: ProductFeature) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, features: [...(p.features || []), feature] }
        : p
    ))
  }, [])

  const removeFeature = useCallback((productId: string, featureId: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, features: (p.features || []).filter(f => f.id !== featureId) }
        : p
    ))
  }, [])

  const getWishlist = useCallback((username: string): string[] => {
    if (!username) return []
    try {
      const raw = localStorage.getItem('dunia-pancing-wishlist-' + username)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }, [])

  const toggleWishlist = useCallback((username: string, productId: string): boolean => {
    if (!username) return false
    const key = 'dunia-pancing-wishlist-' + username
    const current: string[] = (() => {
      try { return JSON.parse(localStorage.getItem(key) || '[]') }
      catch { return [] }
    })()
    const exists = current.includes(productId)
    const next = exists ? current.filter(id => id !== productId) : [...current, productId]
    localStorage.setItem(key, JSON.stringify(next))
    return !exists
  }, [])

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      importPrices,
      getProduct,
      nextId,
      categories,
      addCategory,
      renameCategory,
      deleteCategory,
      getCategoryName,
      categoryKeys,
      loaded,
      getActiveVariant,
      addVariantType,
      updateVariantType,
      removeVariantType,
      addVariantValue,
      updateVariantValue,
      removeVariantValue,
      updateVariant,
      addFeature,
      removeFeature,
      getWishlist,
      toggleWishlist,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within ProductStoreProvider')
  return ctx
}
