import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import {
  loadOrders,
  loadPaginatedOrders,
  getStatusCounts,
  updateOrderStatus,
  assignResi,
  cancelOrder,
  generateResiNumber,
  bulkUpdateOrderStatus,
  bulkAssignResi,
  printInvoice,
} from '../utils/order'
import { USE_KIRIMINAJA_API, STORE_KECAMATAN_ID, STORE_ADDRESS, STORE_PHONE, STORE_NAME, DEFAULT_PACKAGE_WIDTH, DEFAULT_PACKAGE_LENGTH, DEFAULT_PACKAGE_HEIGHT, DEFAULT_PACKAGE_TYPE_ID } from '../config/env'
import { createOrder as kiriminajaCreateOrder } from '../services/kiriminaja'
import MetaTags from '../components/seo/MetaTags'
import type { Order, OrderStatus } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)

const STATUS_TABS: { key: OrderStatus | 'all'; label_id: string; label_en: string; color: string }[] = [
  { key: 'all',           label_id: 'Semua',               label_en: 'All',         color: 'bg-slate-500' },
  { key: 'waiting_payment', label_id: 'Menunggu Bayar',    label_en: 'Unpaid',      color: 'bg-yellow-500' },
  { key: 'paid',          label_id: 'Dibayar',              label_en: 'Paid',        color: 'bg-blue-500' },
  { key: 'to_ship',       label_id: 'Perlu Dikirim',        label_en: 'To Ship',     color: 'bg-orange-500' },
  { key: 'shipping',      label_id: 'Dikirim',              label_en: 'Shipping',    color: 'bg-sky-500' },
  { key: 'completed',     label_id: 'Selesai',              label_en: 'Completed',   color: 'bg-emerald-500' },
  { key: 'cancelled',     label_id: 'Dibatalkan',           label_en: 'Cancelled',   color: 'bg-red-500' },
]

const STATUS_BADGE: Record<string, string> = {
  waiting_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  to_ship: 'bg-orange-100 text-orange-700',
  shipping: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, [string, string]> = {
  waiting_payment: ['Menunggu Bayar', 'Unpaid'],
  paid: ['Dibayar', 'Paid'],
  to_ship: ['Siap Dikirim', 'To Ship'],
  shipping: ['Dikirim', 'Shipping'],
  completed: ['Selesai', 'Completed'],
  cancelled: ['Dibatalkan', 'Cancelled'],
}

export default function AdminOrders() {
  const { lang } = useLang()
  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('to_ship')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<'date' | 'total'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [refreshKey, setRefreshKey] = useState(0)

  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [shipModal, setShipModal] = useState<{ orders: Order[] } | null>(null)
  const [cancelModal, setCancelModal] = useState<{ orderId: string } | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const [bulkAction, setBulkAction] = useState<'ship' | 'complete' | null>(null)
  const [bulkCourier, setBulkCourier] = useState('jne_reg')
  const [bulkPickupType, setBulkPickupType] = useState<'dropoff' | 'pickup'>('dropoff')

  const [processing, setProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const searchRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [searchInput, setSearchInput] = useState('')

  const pageSize = 20

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const debouncedSearch = useCallback((value: string) => {
    setSearchInput(value)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
      setSelectedIds(new Set())
    }, 350)
  }, [])

  const { orders, total, totalPages } = useMemo(() => {
    const status = activeTab === 'all' ? null : activeTab
    return loadPaginatedOrders(page, pageSize, status, search, sortField, sortDir)
  }, [page, pageSize, activeTab, search, sortField, sortDir, refreshKey])

  const statusCounts = useMemo(() => getStatusCounts(), [refreshKey])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map(o => o.id)))
    }
  }

  const refresh = () => setRefreshKey(k => k + 1)

  const handleConfirmPayment = (orderId: string) => {
    updateOrderStatus(orderId, 'paid')
    showToast(lang === 'id' ? 'Pembayaran dikonfirmasi' : 'Payment confirmed', 'success')
    setSelectedIds(new Set())
    refresh()
  }

  const handleConfirmToShip = (orderId: string) => {
    updateOrderStatus(orderId, 'to_ship')
    showToast(lang === 'id' ? 'Pesanan siap dikirim' : 'Order ready to ship', 'success')
    setSelectedIds(new Set())
    refresh()
  }

  const handleMarkCompleted = (orderId: string) => {
    updateOrderStatus(orderId, 'completed')
    showToast(lang === 'id' ? 'Pesanan selesai' : 'Order completed', 'success')
    refresh()
  }

  const handleBulkMarkPaid = () => {
    if (selectedIds.size === 0) return
    setProcessing(true)
    bulkUpdateOrderStatus(Array.from(selectedIds), 'paid')
    showToast(
      lang === 'id'
        ? `${selectedIds.size} pembayaran dikonfirmasi`
        : `${selectedIds.size} payments confirmed`,
      'success',
    )
    setSelectedIds(new Set())
    setProcessing(false)
    refresh()
  }

  const handleBulkComplete = () => {
    if (selectedIds.size === 0) return
    setProcessing(true)
    bulkUpdateOrderStatus(Array.from(selectedIds), 'completed')
    showToast(
      lang === 'id'
        ? `${selectedIds.size} pesanan selesai`
        : `${selectedIds.size} orders completed`,
      'success',
    )
    setSelectedIds(new Set())
    setBulkAction(null)
    setProcessing(false)
    refresh()
  }

  const handleBulkShip = () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const allOrders = loadOrders()
    const selectedOrders = allOrders.filter(o => ids.includes(o.id))
    setBulkAction(null)
    setShipModal({ orders: selectedOrders })
  }

  const handleSingleArrangeShip = (order: Order) => {
    setShipModal({ orders: [order] })
  }

  const handleGenerateResi = async (
    orders: Order[],
    courier: string,
    courierLabel: string,
    pickupType: 'dropoff' | 'pickup',
  ) => {
    setProcessing(true)

    if (USE_KIRIMINAJA_API) {
      try {
        const results: { orderId: string; trackingNumber: string; kjOrderId: string }[] = []
        const failed: string[] = []

        for (const order of orders) {
          try {
            const totalWeight = order.items.reduce((s, i) => s + (i.qty * 500), 200)
            const resp = await kiriminajaCreateOrder({
              address: STORE_ADDRESS,
              phone: STORE_PHONE,
              name: STORE_NAME,
              kecamatan_id: STORE_KECAMATAN_ID,
              packages: [{
                order_id: order.id,
                destination_name: order.customer.name,
                destination_phone: order.customer.phone,
                destination_address: `${order.customer.address}, ${order.customer.city}`,
                destination_kecamatan_id: 0,
                weight: totalWeight,
                width: DEFAULT_PACKAGE_WIDTH,
                length: DEFAULT_PACKAGE_LENGTH,
                height: DEFAULT_PACKAGE_HEIGHT,
                item_value: order.total,
                shipping_cost: order.shipping_fee,
                service: courier,
                service_type: 'REG',
                cod: 0,
                package_type_id: DEFAULT_PACKAGE_TYPE_ID,
                item_name: order.items.map(i => i.name_id).join(', ').slice(0, 200),
                drop: pickupType === 'dropoff',
                qty: order.items.reduce((s, i) => s + i.qty, 0),
              }],
            })

            const details = (resp.details as Array<{ awb?: string; kj_order_id?: string }>) || []
            const awb = details[0]?.awb || generateResiNumber(courier)
            results.push({ orderId: order.id, trackingNumber: awb, kjOrderId: details[0]?.kj_order_id || '' })
          } catch {
            failed.push(order.id)
          }
        }

        const successItems = results.map(r => ({
          orderId: r.orderId,
          courier,
          courierLabel,
          trackingNumber: r.trackingNumber,
          pickupType,
        }))
        const result = bulkAssignResi(successItems)

        if (failed.length > 0) {
          showToast(
            lang === 'id'
              ? `${result.success.length} berhasil, ${failed.length} gagal`
              : `${result.success.length} success, ${failed.length} failed`,
            'error',
          )
        } else {
          showToast(
            lang === 'id'
              ? `${result.success.length} resi berhasil dibuat`
              : `${result.success.length} tracking numbers generated`,
            'success',
          )
        }
      } catch {
        showToast(
          lang === 'id'
            ? 'Gagal terhubung ke KiriminAja, gunakan mode mock'
            : 'Failed to connect to KiriminAja, using mock mode',
          'error',
        )
      }

      setShipModal(null)
      setSelectedIds(new Set())
      setProcessing(false)
      refresh()
      return
    }

    const items = orders.map(order => ({
      orderId: order.id,
      courier,
      courierLabel,
      trackingNumber: generateResiNumber(courier),
      pickupType,
    }))

    const result = bulkAssignResi(items)

    if (result.failed.length > 0) {
      showToast(
        lang === 'id'
          ? `${result.success.length} berhasil, ${result.failed.length} gagal`
          : `${result.success.length} success, ${result.failed.length} failed`,
        'error',
      )
    } else {
      showToast(
        lang === 'id'
          ? `${result.success.length} resi berhasil dibuat`
          : `${result.success.length} tracking numbers generated`,
        'success',
      )
    }

    setShipModal(null)
    setSelectedIds(new Set())
    setProcessing(false)
    refresh()
  }

  const handleCancel = () => {
    if (!cancelModal) return
    if (!cancelReason.trim()) {
      showToast(lang === 'id' ? 'Alasan pembatalan wajib diisi' : 'Cancellation reason is required', 'error')
      return
    }
    cancelOrder(cancelModal.orderId, cancelReason)
    showToast(lang === 'id' ? 'Pesanan dibatalkan' : 'Order cancelled', 'success')
    setCancelModal(null)
    setCancelReason('')
    setDetailOrder(null)
    refresh()
  }

  const handlePrintAwb = (order: Order) => {
    if (!order.logistics?.trackingNumber) return
    markAwbAndPrint(order)
  }

  const markAwbAndPrint = (order: Order) => {
    import('../components/ui/AwbPrint').then(mod => {
      mod.printAwb(order)
    })
  }

  const handleBulkPrintAwb = () => {
    if (selectedIds.size === 0) return
    const allOrders = loadOrders()
    const toPrint = allOrders.filter(
      o => selectedIds.has(o.id) && o.logistics?.trackingNumber,
    )
    if (toPrint.length === 0) {
      showToast(lang === 'id' ? 'Tidak ada resi untuk dicetak' : 'No AWBs to print', 'error')
      return
    }
    import('../components/ui/AwbPrint').then(mod => {
      mod.bulkPrintAwb(toPrint)
    })
  }

  const sidebarLinks = [
    { to: '/admin', label_id: 'Produk', label_en: 'Products', icon: '📦' },
    { to: '/admin/revenue', label_id: 'Pendapatan', label_en: 'Revenue', icon: '💰' },
    { to: '/admin/add', label_id: 'Tambah Produk', label_en: 'Add Product', icon: '➕' },
    { to: '/admin/import', label_id: 'Import Harga', label_en: 'Price Import', icon: '📥' },
  ]

  const CourierSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 font-medium"
    >
      <option value="jne_reg">JNE Regular</option>
      <option value="jne_yes">JNE YES</option>
      <option value="jnt">J&T Express</option>
      <option value="sicepat">SiCepat REG</option>
      <option value="instant">Grab/GoSend</option>
    </select>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title="Pesanan — Admin" />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <div className="flex flex-col sm:flex-row gap-6">
          <aside className="w-full sm:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-50">
                <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Panel</div>
              </div>
              <div className="p-2 space-y-0.5">
                {sidebarLinks.map(link => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                    <span>{link.icon}</span><span>{lang === 'id' ? link.label_id : link.label_en}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-50 p-2">
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all">
                  <span>🚪</span><span>{t('admin_logout', lang)}</span>
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* ─── Toast ─── */}
            {toast && (
              <div className={`fixed top-24 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-[12px] font-bold transition-all ${
                toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {toast.message}
              </div>
            )}

            {/* ─── Tabs ─── */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-4">
              <div className="flex overflow-x-auto gap-0.5 px-2 pt-2">
                {STATUS_TABS.map(tab => {
                  const count = tab.key === 'all' ? statusCounts.all : (statusCounts[tab.key] || 0)
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setPage(1); setSelectedIds(new Set()); setSearch(''); setSearchInput('') }}
                      className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-bold rounded-t-lg transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-slate-900 border-t border-x border-slate-100 -mb-px'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${tab.color}`} />
                      <span>{lang === 'id' ? tab.label_id : tab.label_en}</span>
                      {count > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* ─── Search + Bulk Action Bar ─── */}
              <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => debouncedSearch(e.target.value)}
                  placeholder={lang === 'id' ? 'Cari ID, nama, no. HP...' : 'Search ID, name, phone...'}
                  className="w-full sm:w-72 px-4 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {selectedIds.size} {lang === 'id' ? 'dipilih' : 'selected'}
                      </span>
                      {activeTab === 'waiting_payment' ? (
                        <button
                          onClick={handleBulkMarkPaid}
                          className="px-4 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-600 transition-all"
                        >
                          {lang === 'id' ? `Bayar ${selectedIds.size}` : `Pay ${selectedIds.size}`}
                        </button>
                      ) : null}
                      {activeTab === 'paid' || activeTab === 'to_ship' ? (
                        <button
                          onClick={() => setBulkAction('ship')}
                          className="px-4 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all"
                        >
                          {lang === 'id' ? `Kirim ${selectedIds.size} Pesanan` : `Ship ${selectedIds.size}`}
                        </button>
                      ) : null}
                      {activeTab === 'shipping' ? (
                        <button
                          onClick={handleBulkPrintAwb}
                          className="px-4 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-lg hover:bg-slate-700 transition-all"
                        >
                          {lang === 'id' ? `Cetak ${selectedIds.size} Resi` : `Print ${selectedIds.size} AWBs`}
                        </button>
                      ) : null}
                      {activeTab === 'shipping' ? (
                        <button
                          onClick={handleBulkComplete}
                          className="px-4 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-600 transition-all"
                        >
                          {lang === 'id' ? `Selesaikan ${selectedIds.size}` : `Complete ${selectedIds.size}`}
                        </button>
                      ) : null}
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-3 py-2 text-[12px] font-bold text-slate-400 hover:text-slate-600"
                      >
                        {lang === 'id' ? 'Batal' : 'Clear'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ─── Table ─── */}
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={orders.length > 0 && selectedIds.size === orders.length}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="text-left px-3 py-3 font-bold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="text-left px-3 py-3 font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'id' ? 'Pelanggan' : 'Customer'}
                      </th>
                      <th className="text-center px-3 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        {lang === 'id' ? 'Item' : 'Items'}
                      </th>
                      <th className="text-left px-3 py-3 font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        {lang === 'id' ? 'Tanggal' : 'Date'}
                      </th>
                      <th
                        className="text-right px-3 py-3 font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                        onClick={() => { setSortField('total'); setSortDir(d => d === 'asc' ? 'desc' : 'asc') }}
                      >
                        {lang === 'id' ? 'Total' : 'Total'}
                        {sortField === 'total' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                      </th>
                      <th className="text-left px-3 py-3 font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                        {lang === 'id' ? 'Resi / Kurir' : 'Tracking'}
                      </th>
                      <th className="text-center px-3 py-3 font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'id' ? 'Status' : 'Status'}
                      </th>
                      <th className="text-right px-3 py-3 font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'id' ? 'Aksi' : 'Action'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const isSelected = selectedIds.has(order.id)
                      const itemCount = order.items.reduce((s, i) => s + i.qty, 0)
                      const sl = STATUS_LABEL[order.status] || [order.status, order.status]
                      return (
                        <tr
                          key={order.id}
                          className={`border-t border-slate-50 transition-colors ${
                            isSelected ? 'bg-brand-primary/5' : 'hover:bg-slate-50/50'
                          } ${order.status === 'to_ship' ? 'bg-orange-50/30' : ''}`}
                        >
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(order.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setDetailOrder(order)}
                              className="font-mono font-bold text-[11px] text-brand-primary hover:text-sky-700"
                            >
                              {order.id}
                            </button>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-slate-900 truncate max-w-[150px]">{order.customer.name}</div>
                            <div className="text-[10px] text-slate-400">{order.customer.phone}</div>
                          </td>
                          <td className="px-3 py-3 text-center hidden sm:table-cell">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                              {itemCount}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-500 text-[11px] hidden md:table-cell">
                            {new Date(order.date).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900">{formatPrice(order.total)}</td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            {order.logistics?.trackingNumber ? (
                              <div>
                                <div className="font-mono text-[11px] font-bold text-slate-900">{order.logistics.trackingNumber}</div>
                                <div className="text-[10px] text-slate-400">{order.logistics.courierLabel}</div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {lang === 'id' ? '-' : '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-600'}`}>
                              {lang === 'id' ? sl[0] : sl[1]}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setDetailOrder(order)}
                                className="px-2 py-1 text-[10px] font-bold text-brand-primary hover:bg-sky-50 rounded"
                              >
                                📋
                              </button>
                              {order.status === 'waiting_payment' && (
                                <button
                                  onClick={() => handleConfirmPayment(order.id)}
                                  className="px-2 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  💰
                                </button>
                              )}
                              {order.status === 'paid' && (
                                <button
                                  onClick={() => handleConfirmToShip(order.id)}
                                  className="px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  {lang === 'id' ? '→ Kirim' : '→ Ship'}
                                </button>
                              )}
                              {order.status === 'to_ship' && (
                                <button
                                  onClick={() => handleSingleArrangeShip(order)}
                                  className="px-2 py-1 text-[10px] font-bold text-orange-600 hover:bg-orange-50 rounded"
                                >
                                  📦
                                </button>
                              )}
                              {order.status === 'shipping' && order.logistics && (
                                <button
                                  onClick={() => handlePrintAwb(order)}
                                  className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100 rounded"
                                >
                                  🖨️
                                </button>
                              )}
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => setCancelModal({ orderId: order.id })}
                                  className="px-2 py-1 text-[10px] font-bold text-red-400 hover:text-red-500 hover:bg-red-50 rounded"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-16 text-center text-slate-400 text-[13px]">
                          {lang === 'id' ? 'Tidak ada pesanan' : 'No orders found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ─── Pagination ─── */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">
                    {lang === 'id'
                      ? `Halaman ${page} dari ${totalPages} (${total} pesanan)`
                      : `Page ${page} of ${totalPages} (${total} orders)`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, i, arr) => (
                        <span key={p} className="flex items-center">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300">…</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-[12px] transition-all ${
                              p === page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Order Detail Modal ─── */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-10 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={() => setDetailOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === 'id' ? 'Detail Pesanan' : 'Order Detail'}
                </h3>
                <p className="text-[11px] font-mono font-bold text-brand-primary">{detailOrder.id}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full ${STATUS_BADGE[detailOrder.status]}`}>
                  {lang === 'id' ? STATUS_LABEL[detailOrder.status]?.[0] || detailOrder.status : STATUS_LABEL[detailOrder.status]?.[1] || detailOrder.status}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(detailOrder.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Customer */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {lang === 'id' ? 'Pembeli' : 'Customer'}
                </div>
                <p className="text-sm font-bold text-slate-900">{detailOrder.customer.name}</p>
                <p className="text-[12px] text-slate-600">{detailOrder.customer.phone}</p>
                <p className="text-[12px] text-slate-600">{detailOrder.customer.address}, {detailOrder.customer.city}</p>
                {detailOrder.customer.notes && (
                  <p className="mt-2 text-[11px] text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                    <strong>{lang === 'id' ? 'Catatan:' : 'Notes:'}</strong> {detailOrder.customer.notes}
                  </p>
                )}
              </div>

              {/* Courier / Resi */}
              {detailOrder.logistics && (
                <div className="p-4 bg-sky-50 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-2">
                    {lang === 'id' ? 'Pengiriman' : 'Shipping'}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">{detailOrder.logistics.courierLabel}</p>
                      <p className="font-mono text-[13px] font-bold text-brand-primary">{detailOrder.logistics.trackingNumber}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-600 bg-white px-2 py-1 rounded-full">
                      {detailOrder.logistics.pickupType === 'dropoff' ? (lang === 'id' ? 'Drop-off' : 'Drop-off') : (lang === 'id' ? 'Pickup' : 'Pickup')}
                    </span>
                  </div>

                  {/* AWB Preview */}
                  {detailOrder.status === 'shipping' && (
                    <div className="bg-white border border-sky-200 rounded-xl p-3 text-[10px] font-mono">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-dashed border-sky-200">
                        <span className="font-bold text-slate-900 text-[11px]">DUNIA PANCING</span>
                        <span className="font-bold text-sky-600">{detailOrder.logistics.courierLabel}</span>
                      </div>
                      <div className="flex justify-center mb-2 py-1">
                        <span className="text-[16px] font-black tracking-[4px] text-slate-900">
                          {detailOrder.logistics.trackingNumber}
                        </span>
                      </div>
                      <div className="border-t border-dashed border-sky-200 pt-2 mt-1">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'id' ? 'PENERIMA' : 'RECIPIENT'}
                        </div>
                        <div className="font-bold text-slate-900 text-[11px]">{detailOrder.customer.name}</div>
                        <div className="text-slate-600">{detailOrder.customer.phone}</div>
                        <div className="text-slate-600">{detailOrder.customer.address}</div>
                      </div>
                      <div className="border-t border-dashed border-sky-200 pt-2 mt-2">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'id' ? 'DAFTAR BARANG' : 'ITEMS'}
                        </div>
                        {detailOrder.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-1 text-[9px] text-slate-600">
                            <span>☐</span>
                            <span className="font-bold">{item.qty}x</span>
                            <span className="truncate">{item.name_id}</span>
                          </div>
                        ))}
                        {detailOrder.items.length > 3 && (
                          <div className="text-[8px] text-slate-400 mt-1">
                            +{detailOrder.items.length - 3} {lang === 'id' ? 'item lainnya' : 'more items'}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-sky-200 text-[9px] text-slate-500">
                        <span>{detailOrder.id}</span>
                        <span>{formatPrice(detailOrder.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {lang === 'id' ? 'Barang' : 'Items'} ({detailOrder.items.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {detailOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 w-6 shrink-0">{item.qty}x</span>
                        <span className="text-[12px] text-slate-900 truncate">{item.name_id}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900 shrink-0 ml-2">
                        {formatPrice(item.price_idr * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-[12px]">
                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'id' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>{formatPrice(detailOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{lang === 'id' ? 'Ongkir' : 'Shipping'}</span>
                  <span>{formatPrice(detailOrder.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2 mt-2">
                  <span>{lang === 'id' ? 'Total' : 'Total'}</span>
                  <span>{formatPrice(detailOrder.total)}</span>
                </div>
              </div>

              {/* Timeline */}
              {detailOrder.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {lang === 'id' ? 'Riwayat Status' : 'Status History'}
                  </div>
                  <div className="space-y-2">
                    {detailOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${STATUS_BADGE[h.status]?.split(' ')[0] || 'bg-slate-300'}`} />
                        <div>
                          <span className="font-semibold text-slate-700">
                            {lang === 'id' ? STATUS_LABEL[h.status]?.[0] || h.status : STATUS_LABEL[h.status]?.[1] || h.status}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(h.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {h.note && <p className="text-slate-500 mt-0.5">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              {detailOrder.status === 'waiting_payment' && (
                <button onClick={() => { handleConfirmPayment(detailOrder.id); setDetailOrder(null) }}
                  className="px-5 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-lg hover:bg-emerald-600">
                  {lang === 'id' ? 'Konfirmasi Bayar' : 'Confirm Payment'}
                </button>
              )}
              {detailOrder.status === 'paid' && (
                <button onClick={() => { handleConfirmToShip(detailOrder.id); setDetailOrder(null) }}
                  className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600">
                  {lang === 'id' ? 'Tandai Siap Kirim' : 'Mark Ready to Ship'}
                </button>
              )}
              {detailOrder.status === 'to_ship' && (
                <button onClick={() => { setShipModal({ orders: [detailOrder] }); setDetailOrder(null) }}
                  className="px-5 py-2 bg-orange-500 text-white text-[12px] font-bold rounded-lg hover:bg-orange-600">
                  {lang === 'id' ? 'Atur Pengiriman' : 'Arrange Shipment'}
                </button>
              )}
              {detailOrder.status === 'shipping' && detailOrder.logistics && (
                <button onClick={() => { handlePrintAwb(detailOrder); setDetailOrder(null) }}
                  className="px-5 py-2 bg-slate-800 text-white text-[12px] font-bold rounded-lg hover:bg-slate-700">
                  {lang === 'id' ? 'Cetak Resi' : 'Print AWB'}
                </button>
              )}
              {detailOrder.status !== 'completed' && detailOrder.status !== 'cancelled' && (
                <button onClick={() => { setCancelModal({ orderId: detailOrder.id }); setDetailOrder(null) }}
                  className="px-5 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-lg">
                  {lang === 'id' ? 'Batalkan' : 'Cancel'}
                </button>
              )}
              <button onClick={() => setDetailOrder(null)}
                className="px-5 py-2 text-[12px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">
                {lang === 'id' ? 'Tutup' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Arrange Shipment Modal ─── */}
      {shipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShipModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'id' ? 'Atur Pengiriman' : 'Arrange Shipment'}
              </h3>
              <button onClick={() => setShipModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[11px] text-slate-500">
                {lang === 'id'
                  ? `Mengatur pengiriman untuk ${shipModal.orders.length} pesanan`
                  : `Setting up shipment for ${shipModal.orders.length} orders`}
              </p>

              {shipModal.orders.length === 1 && (
                <div className="p-3 bg-slate-50 rounded-xl text-[12px]">
                  <span className="font-mono font-bold text-slate-900">{shipModal.orders[0].id}</span>
                  <span className="text-slate-400 ml-2">— {shipModal.orders[0].customer.name}</span>
                </div>
              )}

              {/* Courier */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {lang === 'id' ? 'Kurir' : 'Courier'} *
                </label>
                <CourierSelect
                  value={bulkCourier}
                  onChange={setBulkCourier}
                />
              </div>

              {/* Pickup Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {lang === 'id' ? 'Tipe Pengiriman' : 'Shipment Type'} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBulkPickupType('dropoff')}
                    className={`px-4 py-3 rounded-xl text-[12px] font-bold border-2 transition-all ${
                      bulkPickupType === 'dropoff'
                        ? 'border-brand-primary bg-sky-50 text-brand-primary'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🏪</div>
                    <div>{lang === 'id' ? 'Drop-off' : 'Drop-off'}</div>
                    <div className="text-[10px] font-normal opacity-70">
                      {lang === 'id' ? 'Antar ke kurir' : 'Deliver to courier'}
                    </div>
                  </button>
                  <button
                    onClick={() => setBulkPickupType('pickup')}
                    className={`px-4 py-3 rounded-xl text-[12px] font-bold border-2 transition-all ${
                      bulkPickupType === 'pickup'
                        ? 'border-brand-primary bg-sky-50 text-brand-primary'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🚚</div>
                    <div>{lang === 'id' ? 'Pickup' : 'Pickup'}</div>
                    <div className="text-[10px] font-normal opacity-70">
                      {lang === 'id' ? 'Kurir jemput' : 'Courier picks up'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setShipModal(null)}
                className="px-5 py-2 text-[12px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  const courierLabelMap: Record<string, string> = {
                    jne_reg: 'JNE Regular', jne_yes: 'JNE YES', jnt: 'J&T Express',
                    sicepat: 'SiCepat REG', instant: 'Grab/GoSend',
                  }
                  handleGenerateResi(shipModal.orders, bulkCourier, courierLabelMap[bulkCourier] || bulkCourier, bulkPickupType)
                }}
                disabled={processing}
                className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all disabled:opacity-50"
              >
                {processing
                  ? (lang === 'id' ? 'Memproses...' : 'Processing...')
                  : (lang === 'id' ? 'Buat Resi' : 'Generate Resi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bulk Ship Confirm Modal ─── */}
      {bulkAction === 'ship' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setBulkAction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'id' ? 'Kirim Pesanan' : 'Ship Orders'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'id'
                  ? `${selectedIds.size} pesanan akan diproses`
                  : `${selectedIds.size} orders will be processed`}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {lang === 'id' ? 'Kurir' : 'Courier'} *
                </label>
                <CourierSelect value={bulkCourier} onChange={setBulkCourier} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBulkPickupType('dropoff')}
                  className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                    bulkPickupType === 'dropoff' ? 'border-brand-primary bg-sky-50 text-brand-primary' : 'border-slate-200 text-slate-500'
                  }`}>
                  🏪 {lang === 'id' ? 'Drop-off' : 'Drop-off'}
                </button>
                <button onClick={() => setBulkPickupType('pickup')}
                  className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all ${
                    bulkPickupType === 'pickup' ? 'border-brand-primary bg-sky-50 text-brand-primary' : 'border-slate-200 text-slate-500'
                  }`}>
                  🚚 {lang === 'id' ? 'Pickup' : 'Pickup'}
                </button>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => setBulkAction(null)}
                className="px-5 py-2 text-[12px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button onClick={handleBulkShip}
                className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600">
                {lang === 'id' ? 'Lanjutkan' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cancel Modal ─── */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setCancelModal(null); setCancelReason('') }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-red-600">
                {lang === 'id' ? 'Batalkan Pesanan' : 'Cancel Order'}
              </h3>
              <p className="text-[11px] text-slate-500">{cancelModal.orderId}</p>
            </div>
            <div className="p-5">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                {lang === 'id' ? 'Alasan Pembatalan' : 'Cancellation Reason'} *
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Contoh: Pesanan dibatalkan oleh pembeli...' : 'E.g., Order cancelled by buyer...'}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onClick={() => { setCancelModal(null); setCancelReason('') }}
                className="px-5 py-2 text-[12px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">
                {lang === 'id' ? 'Batal' : 'Back'}
              </button>
              <button onClick={handleCancel}
                className="px-5 py-2 bg-red-500 text-white text-[12px] font-bold rounded-lg hover:bg-red-600">
                {lang === 'id' ? 'Ya, Batalkan' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
