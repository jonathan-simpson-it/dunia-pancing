import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useProducts } from '../context/ProductStore'
import MetaTags from '../components/seo/MetaTags'
import ProductCard from '../components/ui/ProductCard'
import CategoryChip from '../components/ui/CategoryChip'
import id from '../locales/id.json'
import en from '../locales/en.json'

const t = (key, lang) => lang === 'id' ? id[key] : en[key]
const PAGE_SIZE = 40

export default function Catalog({ searchTerm, setSearchTerm }) {
  const { lang } = useLang()
  const { products, categories: allCategories, getCategoryName } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState('relevance')
  const [showFilter, setShowFilter] = useState(false)
  const scrollRef = useRef(null)
  const filterRef = useRef(null)
  const loaderRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const activeCategory = searchParams.get('category') || 'all'

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams)
    if (cat === 'all') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    setSearchParams(params)
    setShowFilter(false)
  }

  const updateScrollButtons = () => {
    const el = scrollRef.current
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      updateScrollButtons()
      el.addEventListener('scroll', updateScrollButtons)
      window.addEventListener('resize', updateScrollButtons)
      return () => {
        el.removeEventListener('scroll', updateScrollButtons)
        window.removeEventListener('resize', updateScrollButtons)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false)
      }
    }
    if (showFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilter])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeCategory, searchTerm, sort])

  const sortOptions = [
    { value: 'relevance', localeKey: 'catalog_sort_relevance' },
    { value: 'latest', localeKey: 'catalog_sort_latest' },
    { value: 'bestseller', localeKey: 'catalog_sort_bestseller' },
    { value: 'price_asc', localeKey: 'catalog_sort_price_asc' },
    { value: 'price_desc', localeKey: 'catalog_sort_price_desc' },
  ]

  const catCount = (key) =>
    key === 'all' ? products.length : products.filter(p => p.category === key).length

  const filtered = useMemo(() => {
    let result = [...products]

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory)
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(p =>
        p.name_id.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }

    if (sort === 'price_asc') {
      result.sort((a, b) => a.price_idr - b.price_idr)
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price_idr - a.price_idr)
    } else if (sort === 'bestseller') {
      result.sort((a, b) => b.sold_count - a.sold_count)
    } else if (sort === 'latest') {
      result.sort((a, b) => a.id.localeCompare(b.id))
    }

    return result
  }, [activeCategory, searchTerm, sort])

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE)
    setTimeout(() => {
      loaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }, [])

  const displayed = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <MetaTags title={t('seo_catalog_title', lang)} description={t('seo_catalog_desc', lang)} />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
            <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-700">{t('nav_catalog', lang)}</span>
          </nav>
          <h1 className="text-xl font-bold text-slate-900">
            {t('catalog_title', lang)}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-3">
        {/* Horizontal Category Tabs */}
        <div className="relative">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          )}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1"
          >
                  {['all', ...allCategories.map(c => c.key)].map(cat => (
              <CategoryChip
                key={cat}
                category={cat}
                active={activeCategory === cat}
                onClick={() => setCategory(cat)}
                count={catCount(cat)}
              />
            ))}
          </div>
        </div>

        {/* Sort / Filter Bar */}
        <div className="mt-3 flex items-stretch gap-2">
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide">
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-full transition-all whitespace-nowrap ${
                  sort === opt.value
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {t(opt.localeKey, lang)}
              </button>
            ))}
          </div>

          {/* Filter Button with Popover */}
          <div ref={filterRef} className="relative shrink-0">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full border transition-colors ${
                showFilter || activeCategory !== 'all'
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('catalog_filter', lang)}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {t('catalog_filter', lang)}
                  </span>
                </div>
                <div className="p-2">
            {['all', ...allCategories.map(c => c.key)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                        activeCategory === cat
                          ? 'bg-sky-50 text-brand-primary'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="capitalize">{cat === 'all' ? t('catalog_all', lang) : getCategoryName(cat, lang)}</span>
                      <span className={`text-[10px] ${activeCategory === cat ? 'text-brand-primary' : 'text-slate-400'}`}>
                        {catCount(cat)}
                      </span>
                    </button>
                  ))}
                </div>
                {activeCategory !== 'all' && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => { setCategory('all'); setShowFilter(false) }}
                      className="w-full py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {t('catalog_clear_filter', lang)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 mb-3">
          <span className="text-[12px] text-slate-500 font-medium">
            {lang === 'id'
              ? `Menampilkan ${Math.min(visibleCount, filtered.length)} dari ${filtered.length} produk`
              : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} products`}
          </span>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center mt-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('catalog_search_empty', lang)}</h3>
            <p className="text-slate-400 text-sm mb-6">{t('catalog_search_empty_desc', lang)}</p>
            <button
              onClick={() => { setCategory('all'); setSearchTerm?.(''); setSort('relevance') }}
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all active:scale-95"
            >
              {t('catalog_clear_filter', lang)}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayed.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div ref={loaderRef} className="mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-10 py-3.5 bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  {lang === 'id'
                    ? `Tampilkan Lainnya (${filtered.length - visibleCount})`
                    : `Load More (${filtered.length - visibleCount})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
