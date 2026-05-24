import { useLang } from '../../context/LanguageContext'
import { useProducts } from '../../context/ProductStore'
import id from '../../locales/id.json'
import en from '../../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface CategoryChipProps {
  category: string
  active: boolean
  onClick: () => void
  count?: number
}

export default function CategoryChip({ category, active, onClick, count }: CategoryChipProps) {
  const { lang } = useLang()
  const { getCategoryName } = useProducts()

  const label = category === 'all'
    ? t('catalog_all', lang)
    : getCategoryName(category, lang)

  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap ${
        active
          ? 'bg-brand-primary text-white shadow-sm'
          : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-300 hover:text-sky-600'
      }`}
    >
      <span className="capitalize tracking-tight">{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold leading-none ${
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}
