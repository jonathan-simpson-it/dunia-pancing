import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

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
    <html lang="id">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
