'use client'

import type { ReactNode } from 'react'
import { ProductStoreProvider } from '@/context/ProductStore'
import { CartProvider } from '@/context/CartContext'
import { SearchProvider } from '@/context/SearchContext'

interface Props {
  children: ReactNode
  cart?: boolean
  search?: boolean
}

export default function PageProviders({ children, cart, search }: Props) {
  let content = children

  if (search) {
    content = <SearchProvider>{content}</SearchProvider>
  }

  if (cart) {
    content = <CartProvider>{content}</CartProvider>
  }

  return (
    <ProductStoreProvider>
      {content}
    </ProductStoreProvider>
  )
}
