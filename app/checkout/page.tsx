import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Checkout — Coming Soon',
  description: 'Halaman checkout akan segera hadir.',
}

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-28 pb-16">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-24 h-24 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight mb-4">
          Checkout — Coming Soon
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          Halaman checkout akan tersedia saat marketplace kami diluncurkan.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
