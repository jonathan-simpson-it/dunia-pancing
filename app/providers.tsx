'use client'

import dynamic from 'next/dynamic'
import { Suspense, type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/ui/ScrollToTop'

const ChatButton = dynamic(() => import('@/components/ui/ChatButton'), { ssr: false })
const ChatWindow = dynamic(() => import('@/components/ui/ChatWindow'), { ssr: false })

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AuthProvider>
          <ChatProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Suspense fallback={null}>
              <ChatButton />
              <ChatWindow />
            </Suspense>
          </ChatProvider>
        </AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
