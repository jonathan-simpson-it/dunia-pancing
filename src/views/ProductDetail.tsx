'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductStore'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ui/ProductCard'
import StarRating from '../components/ui/StarRating'
import QuantitySelector from '../components/ui/QuantitySelector'
import VariantSelector from '../components/ui/VariantSelector'
import WishlistButton from '../components/ui/WishlistButton'
import ShareButtons from '../components/ui/ShareButtons'
import FeatureBadges from '../components/ui/FeatureBadges'
import SizeChartModal from '../components/ui/SizeChartModal'
import { formatIDR } from '../utils/formatters'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

function formatSold(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'JT'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'RB'
  return String(n)
}

function formatWishlist(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'RB'
  return String(n)
}

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const { lang } = useLang()
  const router = useRouter()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { products, getProduct, getCategoryName, updateProduct } = useProducts()
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' })
  const [reviewImages, setReviewImages] = useState<string[]>([])
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const product = getProduct(productId || '')

  const related = useMemo(() => {
    if (!product) return []
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 6)
  }, [product, products])

  const hasVariants = product?.variantTypes && product.variantTypes.length > 0

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then(r => r.ok ? r.json() : null)
      .then((apiProduct) => {
        if (!apiProduct) return
        const local: any = {
          id: apiProduct.id,
          name_id: apiProduct.nameId,
          name_en: apiProduct.nameEn,
          category: apiProduct.category || '',
          brand: apiProduct.brand || '',
          specifications: (() => { try { return JSON.parse(apiProduct.specifications || '[]') } catch { return [] } })(),
          price_idr: apiProduct.priceIdr,
          original_price_idr: apiProduct.originalPriceIdr || 0,
          in_stock: apiProduct.inStock,
          sold_count: apiProduct.soldCount,
          rating: apiProduct.rating,
          location: apiProduct.location || '',
          image: apiProduct.image || '',
          images: (() => { try { return JSON.parse(apiProduct.images || '[]') } catch { return [] } })(),
          weight: apiProduct.weight,
          stock_qty: apiProduct.stockQty,
          description_id: apiProduct.descriptionId || '',
          description_en: apiProduct.descriptionEn || '',
          key_features: (() => { try { return JSON.parse(apiProduct.keyFeatures || '[]') } catch { return [] } })(),
          features: (() => { try { return JSON.parse(apiProduct.features || '[]') } catch { return [] } })(),
          variantTypes: apiProduct.variantTypes || [],
          variants: (apiProduct.productVariants || []).map((v: any) => ({
            id: v.id,
            sku: v.sku || '',
            combination: typeof v.combination === 'string' ? JSON.parse(v.combination) : (v.combination || {}),
            price_idr: v.priceIdr ?? v.price_idr ?? 0,
            original_price_idr: v.originalPriceIdr ?? v.original_price_idr,
            stock_qty: v.stockQty ?? v.stock_qty ?? 0,
            weight: v.weight ?? 0,
            image: v.image || '',
          })),
          wishlistCount: apiProduct.wishlistCount || 0,
          shippingEstimateDays: { min: apiProduct.shippingEstimateMin || 2, max: apiProduct.shippingEstimateMax || 5 },
          sizeChart: apiProduct.sizeChartEntries || [],
        }
        updateProduct(productId, local)
      })
      .catch(() => {})
  }, [productId])

  useEffect(() => {
    if (productId) {
      setReviewsLoading(true)
      fetch(`/api/products/${productId}/reviews`)
        .then(r => r.json())
        .then((data) => {
          setReviews(data)
          if (data.length > 0) {
            const avg = Math.round(data.reduce((s: number, r: any) => s + r.rating, 0) / data.length * 10) / 10
            updateProduct(productId, { rating: avg })
          }
        })
        .catch(() => {})
        .finally(() => setReviewsLoading(false))
    }
  }, [productId])

  const handleReviewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - reviewImages.length
    const toProcess = files.slice(0, remaining)

    Promise.all(toProcess.map(f => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(f)
    }))).then(results => {
      setReviewImages(prev => [...prev, ...results].slice(0, 3))
    }).catch(() => {})

    e.target.value = ''
  }

  const removeReviewImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const submitReview = async () => {
    setReviewSubmitting(true)
    setReviewError('')
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewForm, images: reviewImages }),
      })
      if (res.ok) {
        setReviewSubmitted(true)
        setReviewForm({ rating: 5, text: '' })
        setReviewImages([])
        setReviewError('')
        const updated = await fetch(`/api/products/${productId}/reviews`).then(r => r.json())
        setReviews(updated)
        const avgRating = updated.length > 0
          ? Math.round(updated.reduce((s: number, r: any) => s + r.rating, 0) / updated.length * 10) / 10
          : 0
        updateProduct(productId!, { rating: avgRating })
      } else {
        const data = await res.json()
        setReviewError(data.error || 'Gagal mengirim ulasan')
      }
    } catch {
      setReviewError('Terjadi kesalahan, coba lagi')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const activeVariant = useMemo(() => {
    if (!hasVariants || !product) return null
    const combination = selectedVariants
    const vtIds = product.variantTypes.map(vt => vt.id)
    const allSelected = vtIds.every(id => combination[id])
    if (!allSelected) return null
    return product.variants?.find(v =>
      Object.entries(combination).every(([key, val]) => v.combination[key] === val)
    ) || null
  }, [product, selectedVariants, hasVariants])

  const getVariantLabel = useMemo(() => {
    if (!hasVariants || !product) return ''
    return product.variantTypes.map(vt => {
      const val = vt.values.find(v => v.id === selectedVariants[vt.id])
      return val ? val.label : ''
    }).filter(Boolean).join(', ')
  }, [product, selectedVariants, hasVariants])

  const currentPrice = activeVariant?.price_idr || product?.price_idr || 0
  const currentOriginalPrice = activeVariant?.original_price_idr || product?.original_price_idr || 0
  const currentStock = activeVariant?.stock_qty ?? product?.stock_qty ?? 0
  const currentWeight = activeVariant?.weight || product?.weight || 0
  const currentImage = activeVariant?.image || ''

  const imgs = (() => {
    if (currentImage && selectedImg === 0) {
      const base = product?.images || [product?.image || '']
      return [currentImage, ...base.filter(img => img !== currentImage)]
    }
    return (product?.images?.length ? product.images : [product?.image || ''])
  })()

  const discount = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0

  const handleVariantChange = (typeId: string, valueId: string) => {
    setSelectedVariants(prev => ({ ...prev, [typeId]: valueId }))
    setSelectedImg(0)
  }

  const handleAddToCart = () => {
    const variantId = activeVariant?.id
    const label = getVariantLabel
    addToCart(product!, qty, variantId, label)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    const variantId = activeVariant?.id
    const label = getVariantLabel
    addToCart(product!, qty, variantId, label)
    router.push('/cart')
  }

  const allVariantsSelected = !hasVariants || (hasVariants && product?.variantTypes.every(vt => selectedVariants[vt.id]))

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
            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative group">
              <img
                src={imgs[selectedImg] || product.image}
                alt={name}
                className="w-full h-full object-cover transition-all group-hover:scale-105 duration-500"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-lg shadow-lg">
                  -{discount}%
                </span>
              )}
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
                href={`/catalog?category=${product.category}`}
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
                  {t('product_sold_count', lang)} {formatSold(product.sold_count)}
                </span>
              )}
            </div>

            <div className="my-3 border-t border-slate-100" />

            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-brand-primary">
                {formatIDR(currentPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatIDR(currentOriginalPrice)}
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
                <span className={`ml-1 font-semibold ${currentStock > 0 && product.in_stock !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                  {currentStock > 0 && product.in_stock !== false
                    ? `${currentStock} ${t('product_stock_available', lang).toLowerCase()}`
                    : t('product_stock_empty', lang)}
                </span>
              </span>
              {currentWeight > 0 && (
                <span className="text-slate-400">
                  {t('product_detail_weight', lang)}: {currentWeight >= 1000 ? (currentWeight / 1000).toFixed(1) + 'kg' : currentWeight + 'g'}
                </span>
              )}
            </div>

            {hasVariants && (
              <div className="mt-4 space-y-3">
                {!allVariantsSelected && (
                  <p className="text-[11px] text-slate-400 italic">
                    {lang === 'id' ? 'Pilih varian untuk melanjutkan' : 'Select variant to continue'}
                  </p>
                )}
                <VariantSelector
                  variantTypes={product.variantTypes}
                  variants={product.variants || []}
                  selected={selectedVariants}
                  onChange={handleVariantChange}
                />

                {activeVariant?.measurements && Object.keys(activeVariant.measurements).length > 0 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
                    {Object.entries(activeVariant.measurements).map(([key, val]) => (
                      <span key={key} className="text-slate-600">
                        <span className="font-semibold text-slate-700">{key}:</span> {val}
                      </span>
                    ))}
                  </div>
                )}

                {product.sizeChart && product.sizeChart.length > 0 && (
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-[12px] font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    {t('product_size_chart', lang)} →
                  </button>
                )}
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="mt-4">
                <FeatureBadges features={product.features} />
              </div>
            )}

            {product.shippingEstimateDays && (
              <div className="mt-3 flex items-center gap-1 text-[12px] text-slate-500">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('product_shipping_estimate', lang)
                  .replace('{min}', String(product.shippingEstimateDays.min))
                  .replace('{max}', String(product.shippingEstimateDays.max))}
                <span className="ml-2 text-sky-600 font-semibold">{t('product_free_return', lang)}</span>
                <span className="text-slate-300 mx-1">|</span>
                <span className="text-sky-600 font-semibold">{t('product_damage_protection', lang)}</span>
              </div>
            )}

            <div className="my-4 border-t border-slate-100" />

            <div className="flex items-center gap-4">
              <span className="text-[12px] font-semibold text-slate-700">{t('product_detail_qty', lang)}</span>
              <QuantitySelector
                value={qty}
                onChange={setQty}
                max={currentStock > 0 ? currentStock : 1}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!currentStock || (hasVariants && !allVariantsSelected)}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : !currentStock || (hasVariants && !allVariantsSelected)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
                disabled={!currentStock || (hasVariants && !allVariantsSelected)}
                className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-bold border-2 transition-all active:scale-[0.98] ${
                  !currentStock || (hasVariants && !allVariantsSelected)
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                    : 'border-brand-primary text-brand-primary hover:bg-sky-50'
                }`}
              >
                {t('product_detail_buy_now', lang)}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={name} />
              <div className="flex items-center gap-4">
                {user && (
                  <WishlistButton productId={product.id} count={product.wishlistCount || 0} />
                )}
                <span className="text-[12px] text-slate-400 hover:text-slate-600 cursor-pointer transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {t('product_report', lang)}
                </span>
              </div>
            </div>

            {product.key_features && product.key_features.length > 0 && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
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
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {lang === 'id' ? product.description_id : product.description_en}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {t('product_detail_reviews', lang)}
              {reviews.length > 0 && <span className="ml-2 font-normal text-slate-400">({reviews.length} {lang === 'id' ? 'ulasan' : 'reviews'})</span>}
            </h2>

            <div className="space-y-4 mb-6">
              {reviewsLoading ? (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
                  <p className="text-slate-400 text-sm">{lang === 'id' ? 'Memuat...' : 'Loading...'}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
                  <p className="text-slate-400 text-sm">{lang === 'id' ? 'Belum ada ulasan' : 'No reviews yet'}</p>
                </div>
              ) : (
                  reviews.map(r => {
                    const imgs = (() => { try { return JSON.parse(r.images || '[]') } catch { return [] } })()
                    return (
                      <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <StarRating rating={r.rating} size={14} />
                          <span className="text-[11px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        {r.user?.name && <p className="text-[11px] font-semibold text-slate-600 mb-1">{r.user.name}</p>}
                        {r.text && <p className="text-[13px] text-slate-700">{r.text}</p>}
                        {imgs.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {imgs.map((img: string, i: number) => (
                              <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
              )}
            </div>

            {reviewError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[12px] text-red-600 font-medium">{reviewError}</p>
              </div>
            )}

            {reviewSubmitted ? (
              <p className="text-emerald-600 text-[13px] font-semibold">
                ✅ {lang === 'id' ? 'Ulasan terkirim!' : 'Review submitted!'}
              </p>
            ) : !user ? (
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 text-center">
                <p className="text-[12px] text-slate-500">
                  {lang === 'id' ? 'Silakan login untuk memberi ulasan' : 'Please log in to write a review'}
                </p>
              </div>
            ) : reviews.some(r => r.user?.id === user.id) ? (
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 text-center">
                <p className="text-[12px] text-slate-500">
                  {lang === 'id' ? 'Kamu sudah memberi ulasan produk ini' : 'You already reviewed this product'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                <h3 className="text-[13px] font-bold text-slate-900 mb-3">{lang === 'id' ? 'Tulis Ulasan' : 'Write a Review'}</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className={`text-xl transition-all ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none mb-3" rows={3}
                  placeholder={lang === 'id' ? 'Bagikan pengalamanmu...' : 'Share your experience...'} />

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    📷 {lang === 'id' ? 'Tambah Foto' : 'Add Photo'}
                    <input type="file" accept="image/*" multiple onChange={handleReviewImages} className="hidden" />
                  </label>
                  {reviewImages.length > 0 && (
                    <span className="text-[10px] text-slate-400">
                      {reviewImages.length}/3
                    </span>
                  )}
                </div>

                {reviewImages.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {reviewImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                        <button onClick={() => removeReviewImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={submitReview} disabled={reviewSubmitting}
                  className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 disabled:opacity-50">
                  {reviewSubmitting ? (lang === 'id' ? 'Mengirim...' : 'Sending...') : (lang === 'id' ? 'Kirim Ulasan' : 'Submit Review')}
                </button>
              </div>
            )}
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

      <SizeChartModal
        open={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        entries={product.sizeChart || []}
      />
    </div>
  )
}
