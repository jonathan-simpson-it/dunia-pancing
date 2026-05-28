'use client'

import { useLang } from '../../context/LanguageContext'
import Link from 'next/link'
import id from '../../locales/id.json'
import en from '../../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="bg-slate-950 text-slate-400 py-24 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black text-white tracking-tight leading-none uppercase">DUNIA PANCING</span>
                <span className="text-[10px] text-sky-500 font-bold uppercase tracking-[0.2em] mt-1">Palembang</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm font-medium">
              {lang === 'id'
                ? 'Mitra terpercaya pemancing di Palembang sejak 1998. Kami menghadirkan kualitas tingkat dunia untuk hobi memancing Anda.'
                : 'Palembang\'s most trusted angling partner since 1998. Bringing world-class quality gear to your local fishing experience.'}
            </p>
            <div className="flex items-center gap-4">
              {['facebook', 'instagram', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current rounded-sm opacity-20" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm font-bold hover:text-sky-400 transition-colors">Home</Link></li>
              <li><Link href="/catalog" className="text-sm font-bold hover:text-sky-400 transition-colors">Digital Catalog</Link></li>
              <li><Link href="/blog" className="text-sm font-bold hover:text-sky-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm font-bold hover:text-sky-400 transition-colors">Visit Store</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Warranty Info</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Newsletter</h4>
            <p className="text-xs font-bold text-slate-500 mb-6 tracking-wide">Get stock updates and pro tips.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 flex-1"
              />
              <button className="bg-sky-500 text-white px-4 py-3 rounded-xl hover:bg-sky-400 transition-all active:scale-95">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            © 2024 DUNIA PANCING PALEMBANG. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Secure Payments via Shopee</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
