import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import seed from '../data/seed.json'

const ProductContext = createContext()
const PRODUCTS_KEY = 'dunia-pancing-products'
const CATEGORIES_KEY = 'dunia-pancing-categories'

const DEFAULT_CATEGORIES = [
  { key: 'rods', name_id: 'Joran', name_en: 'Rods', icon: '🎣' },
  { key: 'reels', name_id: 'Reel', name_en: 'Reels', icon: '🔄' },
  { key: 'lines', name_id: 'Senar', name_en: 'Lines', icon: '〰️' },
  { key: 'hooks', name_id: 'Kail', name_en: 'Hooks', icon: '🪝' },
  { key: 'lures', name_id: 'Umpan', name_en: 'Lures', icon: '🐟' },
  { key: 'accessories', name_id: 'Aksesoris', name_en: 'Accessories', icon: '🧰' },
]

function loadProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seed))
  return seed
}

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES))
  return DEFAULT_CATEGORIES
}

export function ProductStoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProducts(loadProducts())
    setCategories(loadCategories())
    setLoaded(true)
  }, [])

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

  const addProduct = useCallback((product) => {
    setProducts(prev => [product, ...prev])
  }, [])

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const importPrices = useCallback((priceUpdates) => {
    let updated = []
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

  const getProduct = useCallback((id) => {
    return products.find(p => p.id === id) || null
  }, [products])

  const nextId = useCallback(() => {
    const max = products.reduce((m, p) => {
      const num = parseInt(p.id.replace('dp-', ''), 10)
      return num > m ? num : m
    }, 0)
    return 'dp-' + String(max + 1).padStart(3, '0')
  }, [products])

  const addCategory = useCallback(({ key, name_id, name_en, icon }) => {
    const exists = categories.some(c => c.key === key)
    if (exists) return false
    const cat = { key, name_id, name_en: name_en || name_id, icon: icon || '📦' }
    setCategories(prev => [...prev, cat])
    return true
  }, [categories])

  const renameCategory = useCallback((key, { name_id, name_en, icon }) => {
    setCategories(prev => prev.map(c =>
      c.key === key ? { ...c, name_id: name_id || c.name_id, name_en: name_en || c.name_en, icon: icon || c.icon } : c
    ))
  }, [])

  const deleteCategory = useCallback((key) => {
    const used = products.some(p => p.category === key)
    if (used) return false
    setCategories(prev => prev.filter(c => c.key !== key))
    return true
  }, [products])

  const getCategoryName = useCallback((key, lang) => {
    const cat = categories.find(c => c.key === key)
    if (!cat) return key
    return lang === 'id' ? cat.name_id : cat.name_en
  }, [categories])

  const categoryKeys = useMemo(() => {
    const map = {}
    categories.forEach(c => { map[c.key] = c.key })
    return map
  }, [categories])

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
