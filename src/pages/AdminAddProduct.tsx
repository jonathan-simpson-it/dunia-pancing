import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useProducts } from '../context/ProductStore'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/ui/ImageUploader'
import MetaTags from '../components/seo/MetaTags'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function AdminAddProduct() {
  const { lang } = useLang()
  const { addProduct, nextId, categories } = useProducts()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name_id: '', name_en: '', category: 'rods', brand: '',
    price_idr: '', original_price_idr: '', stock_qty: '',
    weight: '', specifications: '', description_id: '', description_en: '',
    images: [] as string[],
  })
  const [success, setSuccess] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = nextId()
    const specs = form.specifications
      ? form.specifications.split('\n').filter(Boolean).map(s => s.trim())
      : []

    const images = form.images.length > 0
      ? form.images
      : ['https://images.pexels.com/photos/4822237/pexels-photo-4822237.jpeg']

    addProduct({
      id,
      name_id: form.name_id,
      name_en: form.name_en || form.name_id,
      category: form.category,
      brand: form.brand,
      specifications: specs,
      price_idr: Number(form.price_idr),
      original_price_idr: Number(form.original_price_idr) || Number(form.price_idr),
      stock_qty: Number(form.stock_qty) || 0,
      weight: Number(form.weight) || 0,
      in_stock: Number(form.stock_qty) > 0,
      sold_count: 0,
      rating: 0,
      location: 'Palembang',
      description_id: form.description_id,
      description_en: form.description_en || form.description_id,
      image: images[0],
      images,
      key_features: [],
    })

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      navigate('/admin')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title={`${t('admin_add_product', lang)} — Admin`} />

      <div className="max-w-4xl mx-auto px-4 pt-28">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-2">
            <div className="px-4 py-3 border-b border-slate-50">
              <div className="text-sm font-bold text-slate-900">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Panel</div>
            </div>
            <div className="p-2 space-y-0.5">
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <span>📦</span><span>{t('admin_products', lang)}</span>
              </Link>
              <Link to="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <span>📋</span><span>{lang === 'id' ? 'Pesanan' : 'Orders'}</span>
              </Link>
              <Link to="/admin/add" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold bg-brand-primary text-white transition-all">
                <span>➕</span><span>{t('admin_add_product', lang)}</span>
              </Link>
              <Link to="/admin/import" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <span>📥</span><span>{t('admin_import', lang)}</span>
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all mt-2">
                <span>🚪</span><span>{t('admin_logout', lang)}</span>
              </button>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl">
            ✅ {lang === 'id' ? 'Produk berhasil ditambahkan!' : 'Product added successfully!'}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-6">{t('admin_add_product', lang)}</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_name_id', lang)} *</label>
                <input value={form.name_id} onChange={update('name_id')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_name_en', lang)}</label>
                <input value={form.name_en} onChange={update('name_en')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_brand', lang)} *</label>
                <input value={form.brand} onChange={update('brand')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_category', lang)} *</label>
                <select value={form.category} onChange={update('category')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30">
                  {categories.map(c => <option key={c.key} value={c.key}>{c.name_id} ({c.name_en})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_price', lang)} (Rp) *</label>
                <input type="number" value={form.price_idr} onChange={update('price_idr')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required min={0} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_original_price', lang)} (Rp)</label>
                <input type="number" value={form.original_price_idr} onChange={update('original_price_idr')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" min={0} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_stock', lang)} *</label>
                <input type="number" value={form.stock_qty} onChange={update('stock_qty')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required min={0} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_weight', lang)} (g)</label>
                <input type="number" value={form.weight} onChange={update('weight')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30" min={0} />
              </div>
              <div className="sm:col-span-2">
                <ImageUploader
                  value={form.images}
                  onChange={(val) => setForm({ ...form, images: val })}
                  label={t('admin_form_image', lang)}
                  previewClass="w-20 h-20"
                  maxFiles={10}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_specs', lang)} (1 {lang === 'id' ? 'per baris' : 'per line'})</label>
                <textarea value={form.specifications} onChange={update('specifications')} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_desc_id', lang)}</label>
                <textarea value={form.description_id} onChange={update('description_id')} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('admin_form_desc_en', lang)}</label>
                <textarea value={form.description_en} onChange={update('description_en')} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Link to="/admin" className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                {t('admin_cancel', lang)}
              </Link>
              <button type="submit" className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
                {t('admin_save', lang)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
