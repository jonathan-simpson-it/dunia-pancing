'use client'

import { useLang } from '../../context/LanguageContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import id from '../../locales/id.json'
import en from '../../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Navbar() {
  const { lang, toggleLang } = useLang()
  const { isLoggedIn, isAdmin, user } = useAuth()
  const pathname = usePathname()

  const links = [
    { to: '/', key: 'nav_home' },
    { to: '/catalog', key: 'nav_catalog' },
    { to: '/blog', key: 'nav_blog' },
    { to: '/contact', key: 'nav_contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-extrabold text-white tracking-tight leading-none">
                DUNIA PANCING
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-[0.2em] mt-1">
                Palembang • Indonesia
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-1">
              {links.map(l => (
                <Link
                  key={l.to}
                  href={l.to}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname === l.to
                      ? 'text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t(l.key, lang)}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/admin')
                      ? 'text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {isLoggedIn && (
              <Link
                href={isAdmin ? '/admin' : '/account'}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
            <Link
              href={isLoggedIn ? (isAdmin ? '/admin' : '/account') : '/login'}
              className="hidden md:flex items-center justify-center px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              {isLoggedIn ? user?.name : (lang === 'id' ? 'Masuk' : 'Login')}
            </Link>

            <div className="h-6 w-px bg-slate-800 mx-2 hidden md:block" />

            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all active:scale-95"
            >
              <span className={`text-[10px] font-bold ${lang === 'id' ? 'text-sky-400' : ''}`}>ID</span>
              <div className="w-px h-3 bg-slate-700" />
              <span className={`text-[10px] font-bold ${lang === 'en' ? 'text-sky-400' : ''}`}>EN</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
