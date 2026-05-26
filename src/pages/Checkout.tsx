import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductStore'
import MetaTags from '../components/seo/MetaTags'
import StepIndicator from '../components/ui/StepIndicator'
import { formatIDR } from '../utils/formatters'
import { createOrder, SHIPPING_METHODS, PAYMENT_METHODS, buildWhatsAppMessage } from '../utils/order'
import type { FormErrors } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Checkout() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { updateProduct, getProduct } = useProducts()
  const [step, setStep] = useState(0)
  const [customer, setCustomer] = useState({
    name: '', phone: '', address: '', city: 'Palembang', notes: '',
  })
  const [shippingId, setShippingId] = useState('jne_reg')
  const [paymentId, setPaymentId] = useState('bca')
  const [errors, setErrors] = useState<FormErrors>({})
  const [placing, setPlacing] = useState(false)

  const steps = [
    t('checkout_step_customer', lang),
    t('checkout_step_shipping', lang),
    t('checkout_step_payment', lang),
    t('checkout_step_review', lang),
  ]

  const shipping = SHIPPING_METHODS.find(s => s.id === shippingId)!
  const payment = PAYMENT_METHODS.find(p => p.id === paymentId)!

  const validateCustomer = (): boolean => {
    const errs: FormErrors = {}
    if (!customer.name.trim()) errs.name = lang === 'id' ? 'Nama wajib diisi' : 'Name is required'
    if (!customer.phone.trim()) errs.phone = lang === 'id' ? 'No. HP wajib diisi' : 'Phone is required'
    if (!customer.address.trim()) errs.address = lang === 'id' ? 'Alamat wajib diisi' : 'Address is required'
    if (!customer.city.trim()) errs.city = lang === 'id' ? 'Kota wajib diisi' : 'City is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateCustomer()) return
    if (step < steps.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isWalkinPayment = payment.type === 'pay_store' || payment.type === 'cod'

  const handlePlaceOrder = () => {
    setPlacing(true)
    const order = createOrder({
      items,
      subtotal,
      customer,
      shipping: {
        id: shipping.id,
        label: lang === 'id' ? shipping.label_id : shipping.label_en,
        fee: shipping.fee,
      },
      payment: {
        id: payment.id,
        label: lang === 'id' ? payment.label_id : payment.label_en,
        method: payment.type,
        bank: payment.bank,
        accountNumber: payment.accountNumber,
      },
    })
    clearCart()

    order.items.forEach(item => {
      const prod = getProduct(item.id)
      if (prod) {
        updateProduct(item.id, { sold_count: (prod.sold_count || 0) + item.qty })
      }
    })

    if (!isWalkinPayment) {
      const msg = buildWhatsAppMessage(order, lang)
      window.open(
        `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`,
        '_blank'
      )
    }

    navigate(`/order-success/${order.id}`)
  }

  if (items.length === 0 && step === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('cart_empty', lang)}</h2>
          <p className="text-slate-500 mb-8">{t('cart_empty_desc', lang)}</p>
          <Link to="/catalog" className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors shadow">
            {t('cart_empty_cta', lang)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title={`${t('checkout_title', lang)} — Dunia Pancing`} />

      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
            <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/cart" className="hover:text-slate-600 transition-colors">{t('cart_title', lang)}</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-700">{t('checkout_title', lang)}</span>
          </nav>
          <h1 className="text-xl font-bold text-slate-900">{t('checkout_title', lang)}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <StepIndicator steps={steps} current={step} />

        <div className="bg-white rounded-xl border border-slate-100 p-5 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900">{t('checkout_step_customer', lang)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_name', lang)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Budi Santoso"
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_phone', lang)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="08123456789"
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_address', lang)} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Jl. Kebon Jahe No. 123, Ilir Timur I"
                  />
                  {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_city', lang)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={e => setCustomer({ ...customer, city: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.city ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Palembang"
                  />
                  {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_notes', lang)}
                  </label>
                  <input
                    type="text"
                    value={customer.notes}
                    onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                    placeholder={lang === 'id' ? 'Catatan untuk penjual (opsional)' : 'Notes for seller (optional)'}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">{t('checkout_step_shipping', lang)}</h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map(s => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      shippingId === s.id
                        ? 'border-brand-primary bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={s.id}
                      checked={shippingId === s.id}
                      onChange={() => setShippingId(s.id)}
                      className="accent-brand-primary w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">
                        {lang === 'id' ? s.label_id : s.label_en}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lang === 'id' ? s.etd_id : s.etd_en}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {s.fee === 0 ? (lang === 'id' ? 'Gratis' : 'Free') : formatIDR(s.fee)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">{t('checkout_step_payment', lang)}</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentId === p.id
                        ? 'border-brand-primary bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={p.id}
                      checked={paymentId === p.id}
                      onChange={() => setPaymentId(p.id)}
                      className="accent-brand-primary w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">
                        {lang === 'id' ? p.label_id : p.label_en}
                      </div>
                      {p.type === 'bank_transfer' && (
                        <div className="text-[11px] text-slate-500">
                          {`a.n. Dunia Pancing — ${p.bank}`}
                        </div>
                      )}
                    </div>
                    {p.type === 'bank_transfer' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {lang === 'id' ? 'Transfer' : 'Transfer'}
                      </span>
                    )}
                    {p.type === 'cod' && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">COD</span>
                    )}
                    {p.type === 'ewallet' && (
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">E-Wallet</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-5">{t('checkout_step_review', lang)}</h2>
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('checkout_step_customer', lang)}</span>
                    <button onClick={() => setStep(0)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                  <p className="text-[12px] text-slate-600">{customer.phone}</p>
                  <p className="text-[12px] text-slate-600">{customer.address}, {customer.city}</p>
                  {customer.notes && <p className="text-[11px] text-slate-500 mt-1 italic">"{customer.notes}"</p>}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('checkout_step_shipping', lang)}</span>
                    <button onClick={() => setStep(1)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{lang === 'id' ? shipping.label_id : shipping.label_en}</p>
                  <p className="text-[12px] text-slate-500">{lang === 'id' ? shipping.etd_id : shipping.etd_en}</p>
                  <p className="text-[12px] font-semibold text-slate-900 mt-1">
                    {shipping.fee === 0 ? (lang === 'id' ? 'Gratis' : 'Free') : formatIDR(shipping.fee)}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('checkout_step_payment', lang)}</span>
                    <button onClick={() => setStep(2)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{lang === 'id' ? payment.label_id : payment.label_en}</p>
                  {payment.type === 'bank_transfer' && (
                    <p className="text-[12px] text-slate-600">{payment.bank} a.n. Dunia Pancing</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    {lang === 'id' ? 'Pesanan' : 'Order Items'}
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {items.map(item => {
                      const name = lang === 'id' ? item.name_id : item.name_en
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3">
                          <img src={item.image} alt={name} className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-slate-900 truncate">{name}</p>
                            <p className="text-[10px] text-slate-400">{item.qty} × {formatIDR(item.price_idr)}</p>
                          </div>
                          <p className="text-[12px] font-bold text-slate-900 whitespace-nowrap">{formatIDR(item.price_idr * item.qty)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-600">{t('cart_subtotal', lang)}</span>
                    <span className="font-semibold text-slate-900">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-600">{t('cart_shipping', lang)}</span>
                    <span className="font-semibold text-slate-900">{shipping.fee === 0 ? (lang === 'id' ? 'Gratis' : 'Free') : formatIDR(shipping.fee)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
                    <span className="font-bold text-slate-900">{t('cart_total', lang)}</span>
                    <span className="font-bold text-brand-primary">{formatIDR(subtotal + shipping.fee)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`flex ${step === 0 ? 'justify-end' : 'justify-between'} mt-8 pt-5 border-t border-slate-100`}>
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                ← {t('checkout_back', lang)}
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
              >
                {t('checkout_continue', lang)} →
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-8 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {placing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                    {lang === 'id' ? 'Memproses...' : 'Processing...'}
                  </>
                ) : (
                  t('checkout_place_order', lang)
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
