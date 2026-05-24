import { useLang } from '../../context/LanguageContext'
import id from '../../locales/id.json'
import en from '../../locales/en.json'
import { SHOPEE_STORE_URL } from '../../utils/shopee'

const t = (key, lang) => lang === 'id' ? id[key] : en[key]

export default function GoogleMap() {
  const { lang } = useLang()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="aspect-video bg-slate-200 relative">
        <iframe
          title={t('contact_map_placeholder', lang)}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.5!2d104.75!3d-2.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTgnNDguMCJTIDEwNMKwNDUnMDAuMCJF!5e0!3m2!1sid!2sid!4v1"
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-slate-800 text-lg">
          {t('contact_address', lang)}
        </h3>
        <p className="mt-1 text-slate-600">{t('contact_address_detail', lang)}</p>
        <a
          href={SHOPEE_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          {t('contact_shopee_cta', lang)}
        </a>
      </div>
    </div>
  )
}
