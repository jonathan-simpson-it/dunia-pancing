import { useLang } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import MetaTags from '../components/seo/MetaTags'
import GoogleMap from '../components/ui/GoogleMap'
import id from '../locales/id.json'
import en from '../locales/en.json'

const t = (key, lang) => lang === 'id' ? id[key] : en[key]

export default function Contact() {
  const { lang } = useLang()

  return (
    <div className="bg-slate-50 min-h-screen">
      <MetaTags title={t('seo_contact_title', lang)} description={t('seo_contact_desc', lang)} />
      
      <div className="bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-700">/</span>
            <span className="text-sky-400">Contact</span>
          </nav>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            {t('contact_title', lang)}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">
                {t('contact_address', lang)}
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                {t('contact_address_detail', lang)}
              </p>
            </div>

            <div className="bg-white rounded-4xl p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">
                {t('contact_hours', lang)}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-medium uppercase text-xs tracking-widest">{t('contact_hours_weekday', lang)}</span>
                  <span className="text-slate-900 font-black text-sm">{t('contact_hours_weekday_time', lang)}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium uppercase text-xs tracking-widest">{t('contact_hours_sunday', lang)}</span>
                  <span className="text-slate-900 font-black text-sm">{t('contact_hours_sunday_time', lang)}</span>
                </div>
              </div>
            </div>

            <div className="bg-sky-600 rounded-4xl p-10 shadow-xl shadow-sky-500/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-xl font-black mb-2 relative z-10">Direct Message</h3>
              <p className="text-sky-100 text-sm mb-8 relative z-10">Need a quick stock check? Chat with our team on WhatsApp.</p>
              <a 
                href="https://wa.me/628123456789" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center py-4 bg-white text-sky-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-sky-50 transition-all active:scale-95 shadow-xl shadow-white/10 relative z-10"
              >
                Launch WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-8 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative min-h-125">
            <div className="absolute inset-0 z-0">
              <GoogleMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
