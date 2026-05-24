import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import MetaTags from '../components/seo/MetaTags'
import QuantitySelector from '../components/ui/QuantitySelector'
import { formatIDR, discountPercent } from '../utils/formatters'
import id from '../locales/id.json'
import en from '../locales/en.json'

const t = (key, lang) => lang === 'id' ? id[key] : en[key]

export default function Cart() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { items, removeFromCart, updateQty, clearCart, subtotal } = useCart()

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title={`${t('cart_title', lang)} — Dunia Pancing`} />

      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-bold text-slate-900">{t('cart_title', lang)}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t('cart_empty', lang)}</h2>
            <p className="text-slate-500 mb-8">{t('cart_empty_desc', lang)}</p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20"
            >
              {t('cart_empty_cta', lang)}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] text-slate-500 font-medium">
                  {t('cart_count_plural', lang).replace('{count}', items.length.toString())}
                </span>
                <button
                  onClick={clearCart}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  {t('cart_clear', lang)}
                </button>
              </div>

              <div className="space-y-3">
                {items.map(item => {
                  const name = lang === 'id' ? item.name_id : item.name_en
                  const discount = discountPercent(item.original_price_idr, item.price_idr)
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <Link to={`/product/${item.id}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                          <img src={item.image} alt={name} className="w-full h-full object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.id}`} className="text-[13px] font-semibold text-slate-900 line-clamp-2 hover:text-brand-primary transition-colors">
                            {name}
                          </Link>
                          {discount > 0 && (
                            <span className="text-[10px] text-slate-400 line-through block mt-0.5">
                              {formatIDR(item.original_price_idr)}
                            </span>
                          )}
                          <span className="text-sm font-bold text-brand-primary block mt-0.5">
                            {formatIDR(item.price_idr)}
                          </span>
                          <div className="mt-2 flex items-center justify-between">
                            <QuantitySelector
                              value={item.qty}
                              onChange={(qty) => updateQty(item.id, qty)}
                              max={item.stock_qty}
                            />
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors ml-3"
                            >
                              {t('cart_remove', lang)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-xl border border-slate-100 p-5 lg:sticky lg:top-28">
                <h3 className="text-sm font-bold text-slate-900 mb-4">{t('cart_summary', lang)}</h3>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between text-slate-500">
                    <span>{t('cart_subtotal', lang)}</span>
                    <span className="font-semibold text-slate-700">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t('cart_shipping', lang)}</span>
                    <span className="text-emerald-600 font-semibold">—</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-base">
                    <span className="font-bold text-slate-900">{t('cart_total', lang)}</span>
                    <span className="font-bold text-brand-primary">{formatIDR(subtotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full py-3.5 bg-brand-primary hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {lang === 'id' ? 'Checkout' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
