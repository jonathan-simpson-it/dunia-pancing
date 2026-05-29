import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

interface CartContextValue {
  items: CartItem[]
  addToCart: (product: Product, qty?: number, variantId?: string, variantLabel?: string) => void
  removeFromCart: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  loaded: boolean
}

const CartContext = createContext<CartContextValue>(null!)

const STORAGE_KEY = 'dunia-pancing-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loaded])

  const addToCart = useCallback((product: Product, qty = 1, variantId?: string, variantLabel?: string) => {
    setItems(prev => {
      const cartId = variantId ? product.id + '::' + variantId : product.id
      const existing = prev.find(item => {
        const itemCartId = item.variantId ? item.id + '::' + item.variantId : item.id
        return itemCartId === cartId
      })
      if (existing) {
        return prev.map(item => {
          const itemCartId = item.variantId ? item.id + '::' + item.variantId : item.id
          return itemCartId === cartId
            ? { ...item, qty: Math.min(item.qty + qty, item.stock_qty || 99) }
            : item
        })
      }
      return [...prev, {
        id: product.id,
        name_id: product.name_id,
        name_en: product.name_en,
        image: variantId ? (product.variants?.find(v => v.id === variantId)?.image || product.image) : product.image,
        price_idr: product.price_idr,
        original_price_idr: product.original_price_idr,
        stock_qty: product.stock_qty || 99,
        category: product.category,
        brand: product.brand,
        qty,
        variantId,
        variantLabel,
      }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(item => item.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, qty: Math.min(qty, item.stock_qty) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price_idr * item.qty, 0)

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      itemCount,
      subtotal,
      loaded,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
