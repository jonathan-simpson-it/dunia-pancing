import { useLang } from '../../context/LanguageContext'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import id from '../../locales/id.json'
import en from '../../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface NavbarProps {
  searchTerm: string
  onSearchChange: (s: string) => void
}

export default function Navbar({ searchTerm, onSearchChange }: NavbarProps) {
  const { lang, toggleLang } = useLang()
  const { itemCount } = useCart()
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const location = useLocation()
  const isCatalog = location.pathname === '/catalog'

  const links = [
    { to: '/', key: 'nav_home' },
    { to: '/catalog', key: 'nav_catalog' },
    { to: '/contact', key: 'nav_contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
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
                  to={l.to}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname === l.to
                      ? 'text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t(l.key, lang)}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname.startsWith('/admin')
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
                to={isAdmin ? '/admin' : '/account'}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
            <Link
              to={isLoggedIn ? (isAdmin ? '/admin' : '/account') : '/login'}
              className="hidden md:flex items-center justify-center px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              {isLoggedIn ? user?.name : (lang === 'id' ? 'Masuk' : 'Login')}
            </Link>
            <Link
              to="/cart"
              className="relative md:flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
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

        {isCatalog && (
          <div className="pb-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-sky-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm || ''}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={t('nav_search_placeholder', lang)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/50 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
