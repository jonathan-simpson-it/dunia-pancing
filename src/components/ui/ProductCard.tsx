'use client'

import { useState, useRef, memo } from 'react'
import Link from 'next/link'
import { useLang } from '../../context/LanguageContext'
import id from '../../locales/id.json'
import en from '../../locales/en.json'
import { formatIDR, discountPercent, optimizePexelsUrl } from '../../utils/formatters'
import StarRating from './StarRating'
import type { Product } from '../../types'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const { lang } = useLang()
  const name = lang === 'id' ? product.name_id : product.name_en
  const discount = discountPercent(product.original_price_idr, product.price_idr)

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean) as string[]

  const hasMultiple = images.length > 1
  const [currentImg, setCurrentImg] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const startTimer = () => {
    if (!hasMultiple || timerRef.current) return
    timerRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % images.length)
    }, 2000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCurrentImg(0)
  }

  const goNext = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentImg(prev => (prev + 1) % images.length)
  }

  const goPrev = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setCurrentImg(prev => (prev - 1 + images.length) % images.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 30) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  return (
    <div className="bg-white border border-slate-100 overflow-hidden transition-shadow duration-200 hover:shadow-sm">
      <div
        className="block relative aspect-[4/3] bg-slate-50 overflow-hidden group"
        onMouseEnter={startTimer}
        onMouseLeave={stopTimer}
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
        style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 240px' }}
      >
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {images.map((src, i) => (
            <img
              key={i}
              src={optimizePexelsUrl(src, 400, 300)}
              alt={name}
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: i === currentImg ? 1 : 0 }}
            />
          ))}
        </Link>

        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none shadow z-10">
            -{discount}%
          </span>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-white text-slate-900 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider shadow">
              {t('product_stock_empty', lang)}
            </span>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <svg className="w-3 h-3 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <svg className="w-3 h-3 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImg ? 'bg-white scale-110' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-[11px] font-medium text-slate-900 leading-snug line-clamp-2 min-h-[2rem] hover:text-brand-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-1">
          {discount > 0 && (
            <span className="text-[9px] text-slate-400 line-through leading-none block">
              {formatIDR(product.original_price_idr)}
            </span>
          )}
          <span className="text-[13px] font-bold text-brand-primary leading-tight">
            {formatIDR(product.price_idr)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-400">
          {product.rating && (
            <span className="flex items-center gap-0.5">
              <StarRating rating={product.rating} />
              <span>{product.rating}</span>
            </span>
          )}
          {product.sold_count > 0 && (
            <span>
              {t('product_sold_count', lang)} {product.sold_count >= 1000 ? (product.sold_count / 1000).toFixed(1) + 'rb' : product.sold_count}
            </span>
          )}
        </div>

        <Link
          href={`/product/${product.id}`}
          className="mt-1.5 w-full inline-flex items-center justify-center gap-1 py-1 bg-brand-primary hover:bg-sky-600 text-white text-[10px] font-bold rounded transition-colors active:scale-[0.98]"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {t('product_detail_buy_now', lang)}
        </Link>
      </div>
    </div>
  )
}

export default memo(ProductCard)
