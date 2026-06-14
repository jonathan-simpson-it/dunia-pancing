'use client'

import type { ReactNode } from 'react'
import { ProductStoreProvider } from '@/context/ProductStore'

interface Props {
  children: ReactNode
}

export default function PageProviders({ children }: Props) {
  return (
    <ProductStoreProvider>
      {children}
    </ProductStoreProvider>
  )
}
