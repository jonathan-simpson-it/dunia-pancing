'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StepIndicator from '../components/ui/StepIndicator'
import { formatIDR } from '../utils/formatters'
import { SHIPPING_METHODS, PAYMENT_METHODS } from '../utils/order'
import { USE_KIRIMINAJA_API, USE_XENDIT } from '../config/env'
import { searchDistrict } from '../services/kiriminaja'
import type { FormErrors } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

interface ShippingRate {
  id: string
  label_id: string
  label_en: string
  fee: number
  etd_id: string
  etd_en: string
  service_type: string
}

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

function mapKiriminAjaRate(r: any, lang: 'id' | 'en'): ShippingRate {
  const serviceName = r.service_name || r.service
  return {
    id: r.service,
    label_id: serviceName,
    label_en: serviceName,
    fee: parseInt(r.cost),
    etd_id: r.etd ? `${r.etd} hari` : '-',
    etd_en: r.etd ? `${r.etd} days` : '-',
    service_type: r.service_type,
  }
}

export default function Checkout() {
  const { lang } = useLang()
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user, isLoggedIn, loaded } = useAuth()
  const [step, setStep] = useState(0)
  const [customer, setCustomer] = useState({
    name: isLoggedIn ? user?.name || '' : '',
    phone: isLoggedIn ? user?.phone || '' : '',
    address: '', city: 'Palembang', kecamatan: '', notes: '', email: '',
  })
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(SHIPPING_METHODS.map(s => ({ ...s, service_type: '' })))
  const [shippingId, setShippingId] = useState('jne_reg')
  const [paymentId, setPaymentId] = useState('bca')
  const [errors, setErrors] = useState<FormErrors>({})
  const [placing, setPlacing] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [kecamatanId, setKecamatanId] = useState<number | null>(null)
  const pricingTimer = useRef<NodeJS.Timeout | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [voucherError, setVoucherError] = useState('')
  const [voucherApplied, setVoucherApplied] = useState(false)

  useEffect(() => {
    if (!loaded || !isLoggedIn) return
    fetch('/api/user/addresses').then(r => r.json()).then((addrs: any[]) => {
      setAddresses(addrs)
      const def = addrs.find((a: any) => a.isDefault) || addrs[0]
      if (def) {
        setSelectedAddrId(def.id)
        setCustomer({
          name: def.name,
          phone: def.phone,
          address: def.address,
          city: def.city,
          kecamatan: '',
          notes: '',
          email: '',
        })
      }
    }).catch(() => {})
  }, [loaded, isLoggedIn])

  const fetchPricing = useCallback(async (city: string, kecamatan: string) => {
    if (!city.trim() || !kecamatan.trim()) return
    setLoadingShipping(true)

    if (USE_KIRIMINAJA_API) {
      try {
        const searchRes = await searchDistrict(kecamatan)
        const districts = searchRes?.datas || []
        const match = districts.find((d: any) =>
          d.kecamatan_name?.toLowerCase().includes(kecamatan.toLowerCase()) ||
          kecamatan.toLowerCase().includes(d.kecamatan_name?.toLowerCase() || ''),
        )
        const destId = match?.id || 0
        setKecamatanId(destId)

        if (destId) {
          const totalWeight = items.reduce((s, i) => s + (i.qty * 500), 200) + 200
          const pricingRes = await fetch('/api/kiriminaja/pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: 548,
              destination: destId,
              weight: totalWeight,
              item_value: subtotal,
            }),
          })

          if (pricingRes.ok) {
            const pricingData = await pricingRes.json()
            const results = pricingData.results || []
            if (results.length > 0) {
              const mapped = results.map((r: any) => mapKiriminAjaRate(r, lang))
              setShippingRates(mapped)
              if (!mapped.find((r: any) => r.id === shippingId)) {
                setShippingId(mapped[0].id)
              }
              setLoadingShipping(false)
              return
            }
          }
        }
      } catch {
        // fallback to hardcoded pricing
      }
    }

    setShippingRates(SHIPPING_METHODS.map(s => ({ ...s, service_type: '' })))
    setLoadingShipping(false)
  }, [items, subtotal, lang, shippingId])

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return
    const res = await fetch('/api/vouchers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ code: voucherCode, subtotal, shopId: 'default' }),
    })
    const data = await res.json()
    if (data.valid) {
      const discount = data.voucher.type === 'PERCENTAGE'
        ? Math.round(subtotal * data.voucher.value / 100)
        : Math.min(data.voucher.value, subtotal)
      setVoucherDiscount(discount)
      setVoucherApplied(true)
      setVoucherError('')
    } else {
      setVoucherError(data.error || 'Voucher tidak valid')
      setVoucherDiscount(0)
      setVoucherApplied(false)
    }
  }

  const hasCustomerStep = !isLoggedIn
  const steps = hasCustomerStep
    ? [t('checkout_step_customer', lang), t('checkout_step_shipping', lang), t('checkout_step_payment', lang), t('checkout_step_review', lang)]
    : [t('checkout_step_shipping', lang), t('checkout_step_payment', lang), t('checkout_step_review', lang)]

  const STEP_CUSTOMER = hasCustomerStep ? 0 : -1
  const STEP_SHIPPING = hasCustomerStep ? 1 : 0
  const STEP_PAYMENT   = hasCustomerStep ? 2 : 1
  const STEP_REVIEW    = hasCustomerStep ? 3 : 2

  const shipping = shippingRates.find(s => s.id === shippingId) || shippingRates[0] || SHIPPING_METHODS[0]
  const payment = PAYMENT_METHODS.find(p => p.id === paymentId)!
  const total = subtotal + (shipping?.fee || 0) - voucherDiscount

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
    if (step === STEP_CUSTOMER && !validateCustomer()) return
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

  const skipXendit = payment.type === 'pay_store' || payment.type === 'cod' || payment.type === 'bank_transfer'
  const useXenditInvoice = payment.type === 'ewallet'

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.id,
            name_id: i.name_id,
            name_en: i.name_en,
            image: i.image,
            price_idr: i.price_idr,
            qty: i.qty,
            variantId: i.variantId,
            variantLabel: i.variantLabel,
          })),
          subtotal,
          discount: voucherDiscount,
          total: subtotal + shipping.fee - voucherDiscount,
          customer: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            notes: customer.notes,
          },
          kecamatanId,
          kecamatan: customer.kecamatan,
          shipping: {
            id: shipping.id,
            label: lang === 'id' ? shipping.label_id : shipping.label_en,
            fee: shipping.fee,
            service_type: (shipping as any).service_type || '',
          },
          payment: {
            id: payment.id,
            label: lang === 'id' ? payment.label_id : payment.label_en,
            method: payment.type,
            bank: payment.bank,
          },
        }),
      })

      if (!res.ok) throw new Error('Failed to create order')
      const order = await res.json()
      clearCart()

      if (useXenditInvoice) {
        const invRes = await fetch('/api/payments/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: order.total,
            description: `Pesanan ${order.orderNumber}`,
            successRedirectUrl: `${window.location.origin}/order-success/${order.orderNumber}`,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email || '',
            items: items.map(i => ({
              name: lang === 'id' ? i.name_id : i.name_en,
              quantity: i.qty,
              price: i.price_idr,
            })),
          }),
        })

        if (invRes.ok) {
          const invoice = await invRes.json()
          window.location.href = invoice.invoice_url
          return
        }
      }

      router.push(`/order-success/${order.orderNumber}`)
    } catch (err) {
      console.error('Place order error:', err)
      setPlacing(false)
    }
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
          <Link href="/catalog" className="inline-flex items-center px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors shadow">
            {t('cart_empty_cta', lang)}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/cart" className="hover:text-slate-600 transition-colors">{t('cart_title', lang)}</Link>
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
          {step === STEP_CUSTOMER && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900">{t('checkout_step_customer', lang)}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_name', lang)} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Budi Santoso" />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('checkout_phone', lang)} <span className="text-red-500">*</span></label>
                  <input type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="08123456789" />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('checkout_address', lang)} <span className="text-red-500">*</span></label>
                  <textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Jl. Kebon Jahe No. 123, Ilir Timur I" />
                  {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">{t('checkout_city', lang)} <span className="text-red-500">*</span></label>
                  <input type="text" value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all ${errors.city ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    placeholder="Palembang" />
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
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('checkout_email', lang)} <span className="text-slate-400 font-normal">({lang === 'id' ? 'opsional' : 'optional'})</span>
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === STEP_SHIPPING && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">{t('checkout_step_shipping', lang)}</h2>

              {!hasCustomerStep && addresses.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-[12px] font-bold text-slate-600 mb-2">{lang === 'id' ? 'Alamat Pengiriman' : 'Shipping Address'}</h3>
                  <div className="space-y-2">
                    {addresses.map(a => (
                      <label key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddrId === a.id ? 'border-brand-primary bg-sky-50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input type="radio" name="address" checked={selectedAddrId === a.id}
                          onChange={() => {
                            setSelectedAddrId(a.id)
                            setCustomer({ name: a.name, phone: a.phone, address: a.address, city: a.city, kecamatan: '', notes: customer.notes, email: customer.email })
                          }} className="accent-brand-primary w-4 h-4 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-900">{a.label}</span>
                            {a.isDefault && <span className="text-[10px] text-emerald-600 font-bold">{lang === 'id' ? 'Utama' : 'Default'}</span>}
                          </div>
                          <p className="text-[11px] text-slate-600">{a.name} — {a.phone}</p>
                          <p className="text-[11px] text-slate-500">{a.address}, {a.city}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  {lang === 'id' ? 'Kecamatan' : 'District'} <span className="text-slate-400 font-normal">({lang === 'id' ? 'ketik nama kecamatan' : 'type district name'})</span>
                </label>
                <input
                  type="text"
                  value={customer.kecamatan}
                  onChange={e => {
                    setCustomer({ ...customer, kecamatan: e.target.value })
                    if (pricingTimer.current) clearTimeout(pricingTimer.current)
                    pricingTimer.current = setTimeout(() => {
                      fetchPricing(customer.city, e.target.value)
                    }, 800)
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                  placeholder={lang === 'id' ? 'Contoh: Ilir Timur I' : 'e.g. Ilir Timur I'}
                />
              </div>

              {loadingShipping ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <svg className="w-5 h-5 animate-spin inline mr-2" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  {lang === 'id' ? 'Memuat ongkos kirim...' : 'Loading shipping rates...'}
                </div>
              ) : (
                <div className="space-y-3">
                  {shippingRates.map(s => (
                    <label key={s.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        shippingId === s.id ? 'border-brand-primary bg-sky-50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <input type="radio" name="shipping" value={s.id} checked={shippingId === s.id}
                        onChange={() => setShippingId(s.id)} className="accent-brand-primary w-4 h-4" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-900">{lang === 'id' ? s.label_id : s.label_en}</div>
                        <div className="text-[11px] text-slate-500">{lang === 'id' ? s.etd_id : s.etd_en}</div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {s.fee === 0 ? (lang === 'id' ? 'Gratis' : 'Free') : formatIDR(s.fee)}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === STEP_PAYMENT && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4">{t('checkout_step_payment', lang)}</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.filter(p => USE_XENDIT || p.type !== 'ewallet').map(p => (
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

          {step === STEP_REVIEW && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-5">{t('checkout_step_review', lang)}</h2>
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('checkout_step_customer', lang)}</span>
                    <button onClick={() => setStep(STEP_CUSTOMER >= 0 ? STEP_CUSTOMER : STEP_SHIPPING)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                  <p className="text-[12px] text-slate-600">{customer.phone}</p>
                  <p className="text-[12px] text-slate-600">{customer.address}, {customer.city}</p>
                  {customer.notes && <p className="text-[11px] text-slate-500 mt-1 italic">"{customer.notes}"</p>}
                  {customer.kecamatan && <p className="text-[11px] text-slate-500 mt-1">{lang === 'id' ? 'Kecamatan' : 'District'}: {customer.kecamatan}</p>}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('checkout_step_shipping', lang)}</span>
                    <button onClick={() => setStep(STEP_SHIPPING)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
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
                    <button onClick={() => setStep(STEP_PAYMENT)} className="text-[11px] text-brand-primary font-semibold hover:underline">{t('checkout_change', lang)}</button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{lang === 'id' ? payment.label_id : payment.label_en}</p>
                  {payment.type === 'bank_transfer' && (
                    <p className="text-[12px] text-slate-600">{payment.bank} a.n. Dunia Pancing</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voucher</span>
                    {!voucherApplied ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)}
                          placeholder="KODE VOUCHER"
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] w-28 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 uppercase" />
                        <button onClick={applyVoucher}
                          className="px-3 py-1.5 bg-brand-primary text-white text-[11px] font-bold rounded-lg hover:bg-sky-600">
                          Pakai
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-600">✅ {voucherCode}</span>
                        <button onClick={() => { setVoucherApplied(false); setVoucherCode(''); setVoucherDiscount(0) }}
                          className="text-[10px] text-slate-400 hover:text-red-500">Hapus</button>
                      </div>
                    )}
                  </div>
                  {voucherError && <p className="text-[11px] text-red-500 mt-1">{voucherError}</p>}
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
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-emerald-600 font-semibold">{lang === 'id' ? 'Diskon Voucher' : 'Voucher Discount'}</span>
                      <span className="font-semibold text-emerald-600">-{formatIDR(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
                    <span className="font-bold text-slate-900">{t('cart_total', lang)}</span>
                    <span className="font-bold text-brand-primary">{formatIDR(total)}</span>
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
