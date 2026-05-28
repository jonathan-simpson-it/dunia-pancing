'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductStore'
import { loadOrders } from '../utils/order'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)

export default function AdminRevenue() {
  const { lang } = useLang()
  const { user, logout } = useAuth()
  const { products } = useProducts()

  const data = useMemo(() => {
    const orders = loadOrders()
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length
    const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0)
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const byPayment: Record<string, number> = {}
    const byShipping: Record<string, number> = {}
    const byMonth: Record<string, number> = {}

    orders.forEach(o => {
      const pm = o.payment?.label || 'Unknown'
      byPayment[pm] = (byPayment[pm] || 0) + o.total

      const sm = o.shipping?.label || 'Unknown'
      byShipping[sm] = (byShipping[sm] || 0) + o.total

      const m = new Date(o.date).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      byMonth[m] = (byMonth[m] || 0) + o.total
    })

    const topProducts = [...products]
      .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
      .slice(0, 10)

    return { orders, totalRevenue, totalOrders, totalItems, avgOrder, byPayment, byShipping, byMonth, topProducts }
  }, [products])

  const stats = [
    { label_id: 'Total Pendapatan', label_en: 'Total Revenue', value: formatPrice(data.totalRevenue), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label_id: 'Total Pesanan', label_en: 'Total Orders', value: data.totalOrders.toString(), color: 'text-brand-primary', bg: 'bg-sky-50' },
    { label_id: 'Rata-rata Pesanan', label_en: 'Avg Order Value', value: formatPrice(data.avgOrder), color: 'text-purple-600', bg: 'bg-purple-50' },
    { label_id: 'Total Item Terjual', label_en: 'Total Items Sold', value: data.totalItems.toString(), color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  const maxPayment = Math.max(...Object.values(data.byPayment), 1)
  const maxShipping = Math.max(...Object.values(data.byShipping), 1)
  const maxMonth = Math.max(...Object.values(data.byMonth), 1)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">


      <div className="max-w-7xl mx-auto px-4 pt-28">
        <div className="flex flex-col sm:flex-row gap-6">
          <aside className="w-full sm:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50">
                <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Panel</div>
              </div>
              <div className="p-2 space-y-0.5">
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                </Link>
                <Link href="/admin/add" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                </Link>
                <Link href="/admin/import" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                </Link>
                <Link href="/admin/revenue" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold bg-brand-primary text-white transition-all">
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <span>📋</span><span>{lang === 'id' ? 'Pesanan' : 'Orders'}</span>
                </Link>
                <Link href="/admin/add" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <span>➕</span><span>{lang === 'id' ? 'Tambah Produk' : 'Add Product'}</span>
                </Link>
                <Link href="/admin/import" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <span>📥</span><span>{t('admin_import', lang)}</span>
                </Link>
                <Link href="/admin/revenue" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold bg-brand-primary text-white transition-all">
                  <span>💰</span><span>{lang === 'id' ? 'Pendapatan' : 'Revenue'}</span>
                </Link>
              </div>
              <div className="border-t border-slate-50 p-2">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all">
                  <span>🚪</span><span>{t('admin_logout', lang)}</span>
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl border border-slate-100 p-4`}>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">
                    {lang === 'id' ? s.label_id : s.label_en}
                  </div>
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'id' ? '🏆 Produk Terlaris' : '🏆 Top Products'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider w-10">#</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Produk' : 'Product'}</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Terjual' : 'Sold'}</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Pendapatan' : 'Revenue'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p, i) => (
                      <tr key={p.id} className={`border-t border-slate-50 hover:bg-slate-50/50 ${i === 0 ? 'bg-yellow-50/50' : ''}`}>
                        <td className={`px-4 py-3 font-bold text-center ${i === 0 ? 'text-yellow-600 text-base' : 'text-slate-400'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{p.name_id}</div>
                          <div className="text-[10px] text-slate-400">{p.brand}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {p.sold_count >= 1000 ? (p.sold_count / 1000).toFixed(1) + 'rb' : p.sold_count}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          {formatPrice((p.sold_count || 0) * p.price_idr)}
                        </td>
                      </tr>
                    ))}
                    {data.topProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-slate-400 text-[13px]">
                          {lang === 'id' ? 'Belum ada data penjualan' : 'No sales data yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  {lang === 'id' ? 'Pendapatan per Pembayaran' : 'Revenue by Payment'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(data.byPayment).map(([label, amount]) => {
                    const pct = (amount / maxPayment) * 100
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="font-medium text-slate-700">{label}</span>
                          <span className="font-bold text-slate-900">{formatPrice(amount)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {Object.keys(data.byPayment).length === 0 && (
                    <p className="text-slate-400 text-[12px]">{lang === 'id' ? 'Belum ada data' : 'No data yet'}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  {lang === 'id' ? 'Pendapatan per Pengiriman' : 'Revenue by Shipping'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(data.byShipping).map(([label, amount]) => {
                    const pct = (amount / maxShipping) * 100
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="font-medium text-slate-700">{label}</span>
                          <span className="font-bold text-slate-900">{formatPrice(amount)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {Object.keys(data.byShipping).length === 0 && (
                    <p className="text-slate-400 text-[12px]">{lang === 'id' ? 'Belum ada data' : 'No data yet'}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5 lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  {lang === 'id' ? 'Pendapatan per Bulan' : 'Monthly Revenue'}
                </h3>
                <div className="flex items-end gap-3 h-32">
                  {Object.entries(data.byMonth).map(([month, amount]) => {
                    const pct = (amount / maxMonth) * 100
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-600">{formatPrice(amount)}</span>
                        <div className="w-full bg-emerald-100 rounded-t-md relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t-md transition-all" style={{ height: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">{month}</span>
                      </div>
                    )
                  })}
                  {Object.keys(data.byMonth).length === 0 && (
                    <p className="text-slate-400 text-[12px] w-full text-center">
                      {lang === 'id' ? 'Belum ada data' : 'No data yet'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mt-6">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'id' ? 'Pesanan Terbaru' : 'Recent Orders'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Pesanan' : 'Order'}</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Pelanggan' : 'Customer'}</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">{lang === 'id' ? 'Tanggal' : 'Date'}</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Total' : 'Total'}</th>
                      <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Status' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.slice(0, 20).map(o => (
                      <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 text-[11px]">{o.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{o.customer?.name || '-'}</div>
                          <div className="text-[10px] text-slate-400">{o.customer?.phone || ''}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell text-[11px]">
                          {new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrice(o.total)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">
                            {lang === 'id' ? 'Menunggu' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-[13px]">
                          {lang === 'id' ? 'Belum ada pesanan' : 'No orders yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
