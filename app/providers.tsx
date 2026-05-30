'use client'

import type { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { ProductStoreProvider } from '@/context/ProductStore'
import { CartProvider } from '@/context/CartContext'
import { SearchProvider } from '@/context/SearchContext'
import { ChatProvider } from '@/context/ChatContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatButton from '@/components/ui/ChatButton'
import ChatWindow from '@/components/ui/ChatWindow'
import ScrollToTop from '@/components/ui/ScrollToTop'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProductStoreProvider>
            <CartProvider>
              <SearchProvider>
                <ChatProvider>
                  <ScrollToTop />
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <ChatButton />
                    <ChatWindow />
                  </div>
                </ChatProvider>
              </SearchProvider>
            </CartProvider>
          </ProductStoreProvider>
        </AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
