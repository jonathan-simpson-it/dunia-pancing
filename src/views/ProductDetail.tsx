'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductStore'
import ProductCard from '../components/ui/ProductCard'
import StarRating from '../components/ui/StarRating'
import QuantitySelector from '../components/ui/QuantitySelector'
import { formatIDR } from '../utils/formatters'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const { lang } = useLang()
  const router = useRouter()
  const { addToCart } = useCart()
  const { products, getProduct, getCategoryName } = useProducts()
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = getProduct(productId || '')

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 6)
  }, [product, products])

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('product_detail_not_found', lang)}</h2>
          <p className="text-slate-500 mb-8">{t('product_detail_not_found_desc', lang)}</p>
          <Link href="/catalog" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            {t('product_detail_back', lang)}
          </Link>
        </div>
      </div>
    )
  }

  const name = lang === 'id' ? product.name_id : product.name_en
  const discount = product.original_price_idr > product.price_idr
    ? Math.round(((product.original_price_idr - product.price_idr) / product.original_price_idr) * 100)
    : 0
  const imgs = product.images || [product.image]

  const handleAddToCart = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart(product, qty)
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-white pb-16">

      <div className="bg-white border-b border-slate-100 pt-28 pb-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/catalog" className="hover:text-slate-600 transition-colors">{t('nav_catalog', lang)}</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/catalog?category=${product.category}`} className="hover:text-slate-600 transition-colors capitalize">
              {getCategoryName(product.category, lang)}
            </Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-700 truncate max-w-[160px]">{name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[55%] shrink-0">
            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
              <img
                src={imgs[selectedImg]}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImg ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {product.brand}
              </span>
              <Link
                to={`/catalog?category=${product.category}`}
                className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded capitalize hover:bg-sky-100 transition-colors"
              >
                {getCategoryName(product.category, lang)}
              </Link>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-[12px] text-slate-500">
              {product.rating && (
                <span className="flex items-center gap-1">
                  <StarRating rating={product.rating} size={13} />
                  <span className="font-semibold text-slate-700">{product.rating}</span>
                </span>
              )}
              {product.sold_count > 0 && (
                <span className="text-slate-400">
                  {t('product_sold_count', lang)} {product.sold_count >= 1000 ? (product.sold_count / 1000).toFixed(1) + 'rb' : product.sold_count}
                </span>
              )}
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-brand-primary">
                {formatPrice(product.price_idr)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.original_price_idr)}
                  </span>
                  <span className="text-[11px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-[12px]">
              <span className="text-slate-500">
                {t('product_detail_stock', lang)}:
                <span className={`ml-1 font-semibold ${product.stock_qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {product.stock_qty > 0 ? `${product.stock_qty} ${t('product_stock_available', lang).toLowerCase()}` : t('product_stock_empty', lang)}
                </span>
              </span>
              {product.weight && (
                <span className="text-slate-400">
                  {t('product_detail_weight', lang)}: {product.weight >= 1000 ? (product.weight / 1000).toFixed(1) + 'kg' : product.weight + 'g'}
                </span>
              )}
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-center gap-4">
              <span className="text-[12px] font-semibold text-slate-700">{t('product_detail_qty', lang)}</span>
              <QuantitySelector
                value={qty}
                onChange={setQty}
                max={product.stock_qty || 99}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-primary text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20'
                }`}
              >
                {added ? (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Ditambahkan!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {t('product_detail_add_cart', lang)}
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 rounded-xl text-sm font-bold border-2 border-brand-primary text-brand-primary hover:bg-sky-50 transition-all active:scale-[0.98]"
              >
                {t('product_detail_buy_now', lang)}
              </button>
            </div>

            {product.key_features && product.key_features.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t('product_key_feature', lang)}
                </h4>
                <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                  {product.key_features.flat().map((f, i) => (
                    <span key={i} className="text-[12px] text-slate-600 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 max-w-4xl">
          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-slate-900 mb-4">{t('product_detail_specs', lang)}</h2>
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : ''}>
                        <td className="px-4 py-2.5 text-slate-500 font-medium w-1/3 border-b border-slate-100">{spec}</td>
                        <td className="px-4 py-2.5 text-slate-900 border-b border-slate-100">✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-4">{t('product_detail_desc', lang)}</h2>
            <div className="text-sm text-slate-600 leading-relaxed">
              {lang === 'id' ? product.description_id : product.description_en}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {t('product_detail_reviews', lang)}
              {product.rating && <span className="ml-2 font-normal text-slate-400">({t('product_sold_count', lang)} {product.sold_count})</span>}
            </h2>
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
              {product.rating && (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-slate-900">{product.rating}</span>
                  <div className="text-left">
                    <StarRating rating={product.rating} size={16} />
                    <div className="text-[11px] text-slate-400 mt-0.5">{product.sold_count} {t('product_detail_reviews', lang).toLowerCase()}</div>
                  </div>
                </div>
              )}
              <p className="text-slate-400 text-sm">{lang === 'id' ? 'Belum ada ulasan tertulis' : 'No written reviews yet'}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-slate-900 mb-5">{t('product_detail_related', lang)}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
