import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Dunia Pancing Palembang',
    default: 'Dunia Pancing Palembang',
  },
  description:
    'Pusat Alat Pancing Terlengkap di Palembang. Joran, Reel, Senar, Kail, Umpan, dan Aksesoris. Melayani Eceran dan Grosir.',
  openGraph: {
    title: 'Dunia Pancing Palembang',
    description:
      'Pusat Alat Pancing Terlengkap di Palembang.',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </head>
      <body className="bg-slate-50 text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
