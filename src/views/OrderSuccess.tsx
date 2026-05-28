'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import InvoicePrint from '../components/ui/InvoicePrint'
import Barcode from '../components/ui/Barcode'
import { getOrder, buildWhatsAppMessage } from '../utils/order'
import type { Order } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function OrderSuccess() {
  const params = useParams()
  const orderId = params.orderId as string
  const { lang } = useLang()
  const order: Order | null = getOrder(orderId || '')

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('order_not_found', lang)}</h2>
          <p className="text-slate-500 mb-8">{t('order_not_found_desc', lang)}</p>
          <Link href="/catalog" className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            {t('product_detail_back', lang)}
          </Link>
        </div>
      </div>
    )
  }

  const waMsg = buildWhatsAppMessage(order, lang)

  const handleWA = () => {
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(waMsg)}`,
      '_blank'
    )
  }

  const handleCopyPayment = () => {
    const info = order.payment.type === 'bank_transfer'
      ? `Bank: ${order.payment.bank}\nNo. Rek: ${order.payment.accountNumber}\na.n. Dunia Pancing Palembang\nTotal: Rp${order.total.toLocaleString('id-ID')}`
      : `Order ID: ${order.id}\nTotal: Rp${order.total.toLocaleString('id-ID')}`
    navigator.clipboard.writeText(info)
  }

  const isBankTransfer = order.payment.type === 'bank_transfer'
  const isWalkinPayment = order.payment.type === 'pay_store' || order.payment.type === 'cod'

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-28">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center mb-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('order_success_title', lang)}</h1>
          <p className="text-slate-500 mb-6">{t('order_success_desc', lang)}</p>

          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('order_success_number', lang)}</span>
            <span className="text-lg font-bold font-mono text-slate-900 tracking-wider">{order.id}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 text-[11px] font-bold rounded-full">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('order_success_status', lang)}
            </span>
          </div>
        </div>

        {isBankTransfer && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">{t('order_success_payment_info', lang)}</h3>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Bank</span>
                <span className="font-bold text-slate-900">{order.payment.bank}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">{lang === 'id' ? 'No. Rekening' : 'Account No.'}</span>
                <span className="font-bold text-slate-900 font-mono">{order.payment.accountNumber}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">{lang === 'id' ? 'Atas Nama' : 'Account Name'}</span>
                <span className="font-bold text-slate-900">Dunia Pancing Palembang</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm">
                <span className="font-bold text-slate-900">{t('cart_total', lang)}</span>
                <span className="font-bold text-brand-primary text-base">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">{lang === 'id' ? 'Batas Waktu Pembayaran' : 'Payment Deadline'}</span>
                <span className="font-semibold text-red-500">24 {lang === 'id' ? 'jam' : 'hours'}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCopyPayment}
                className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {lang === 'id' ? 'Salin Info Pembayaran' : 'Copy Payment Info'}
              </button>
              <button
                onClick={handleWA}
                className="flex-1 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {lang === 'id' ? 'Konfirmasi via WhatsApp' : 'Confirm via WhatsApp'}
              </button>
            </div>
          </div>
        )}

        {isWalkinPayment && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('order_success_payment_info', lang)}</h3>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mb-4">
              <div className="text-3xl mb-2">
                {order.payment.type === 'pay_store' ? '🏪' : '💵'}
              </div>
              <p className="text-sm font-bold text-emerald-800">
                {lang === 'id'
                  ? 'Pesanan dicatat — Silakan selesaikan pembayaran di toko'
                  : 'Order recorded — Please complete payment at store'}
              </p>
              <p className="text-[12px] text-emerald-600 mt-1">
                {order.payment.label} — {formatPrice(order.total)}
              </p>
            </div>
          </div>
        )}

        {!isBankTransfer && !isWalkinPayment && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">{t('order_success_payment_info', lang)}</h3>
            <p className="text-[13px] text-slate-600 mb-4">
              {order.payment.label} — {t('order_success_total', lang)} {formatPrice(order.total)}
            </p>
            <button
              onClick={handleWA}
              className="w-full py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {lang === 'id' ? 'Kirim Pesan via WhatsApp' : 'Send via WhatsApp'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">{t('order_success_summary', lang)}</h3>
          <div className="divide-y divide-slate-100 mb-4">
            {order.items.map((item, i) => {
              const name = lang === 'id' ? item.name_id : item.name_en
              return (
                <div key={i} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt={name} className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-slate-900 truncate">{name}</p>
                    <p className="text-[10px] text-slate-400">{item.qty} × {formatPrice(item.price_idr)}</p>
                  </div>
                  <p className="text-[12px] font-bold text-slate-900">{formatPrice(item.price_idr * item.qty)}</p>
                </div>
              )
            })}
          </div>
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-[13px]">
            <div className="flex justify-between text-slate-600">
              <span>{t('cart_subtotal', lang)}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('cart_shipping', lang)}</span>
              <span>{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>{t('cart_total', lang)}</span>
              <span className="text-brand-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm text-center">
          <h3 className="text-sm font-bold text-slate-900 mb-3">{lang === 'id' ? 'Barcode Pengiriman' : 'Delivery Barcode'}</h3>
          <div className="flex justify-center">
            <Barcode value={order.id} height={60} width={2} fontSize={16} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{order.id}</p>
        </div>

        <div className="mb-8">
          <InvoicePrint order={order} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Link
            to="/catalog"
            className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-all text-center shadow"
          >
            {t('order_success_continue', lang)}
          </Link>
        </div>
      </div>
    </div>
  )
}
