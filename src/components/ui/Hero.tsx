import { useLang } from '../../context/LanguageContext'
import Link from 'next/link'
import id from '../../locales/id.json'
import en from '../../locales/en.json'
import { SHOPEE_STORE_URL } from '../../utils/shopee'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Hero() {
  const { lang } = useLang()

  return (
    <section className="relative overflow-hidden min-h-150 flex items-center">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/2132126/pexels-photo-2132126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Fishing Background"
          className="w-full h-full object-cover scale-110 blur-[2px] opacity-90"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900/90 to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest leading-none">
              Premium Angling Supplies
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white leading-[1.1] tracking-tight">
            {t('hero_title', lang)}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-medium">
            {t('hero_subtitle', lang)}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/catalog"
              className="px-8 py-4 bg-sky-500 text-white font-bold rounded-2xl hover:bg-sky-400 transition-all shadow-xl shadow-sky-500/25 active:scale-95 text-center"
            >
              {t('hero_cta_catalog', lang)}
            </Link>
            <a
              href={SHOPEE_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all active:scale-95 text-center"
            >
              {t('hero_cta_shopee', lang)}
            </a>
          </div>
          
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10 max-w-xl">
            {[
              { label: 'Products', val: '2k+' },
              { label: 'Customers', val: '10k+' },
              { label: 'Experience', val: '15y' }
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">{stat.val}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
