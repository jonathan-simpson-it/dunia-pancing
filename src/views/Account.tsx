'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { loadOrders } from '../utils/order'
import type { Order } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface UserAddress {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  isDefault: boolean
}

export default function Account() {
  const { lang } = useLang()
  const router = useRouter()
  const { user, logout, loaded, isLoggedIn } = useAuth()
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)
  const testingMode = process.env.NEXT_PUBLIC_TESTING_MODE === 'true'
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [addrForm, setAddrForm] = useState({ label: '', name: '', phone: '', address: '', city: '' })

  useEffect(() => {
    if (loaded && !isLoggedIn) router.replace('/login')
  }, [loaded, isLoggedIn, router])

  const handleMarkPaid = async (orderId: string) => {
    setProcessingOrderId(orderId)
    try {
      const res = await fetch(`/api/testing/orders/${orderId}/mark-paid`, {
        method: 'PUT',
      })
      if (res.ok) {
        setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid' } : o))
      }
    } catch {}
    setProcessingOrderId(null)
  }

  const handleMarkCompleted = async (orderId: string) => {
    setProcessingOrderId(orderId)
    try {
      const res = await fetch(`/api/testing/orders/${orderId}/mark-completed`, {
        method: 'PUT',
      })
      if (res.ok) {
        setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o))
      }
    } catch {}
    setProcessingOrderId(null)
  }

  useEffect(() => {
    if (!user?.username) return
    loadOrders().then(orders => {
      setMyOrders(orders.filter(o => o.customer?.phone === user.username))
    })
  }, [user?.username])

  useEffect(() => {
    if (!isLoggedIn) return
    fetch('/api/user/addresses').then(r => r.json()).then(setAddresses).catch(() => {})
  }, [isLoggedIn])

  const openNewAddress = () => {
    setEditingAddress(null)
    setAddrForm({ label: '', name: user?.name || '', phone: user?.phone || '', address: '', city: 'Palembang' })
    setShowAddressForm(true)
  }

  const openEditAddress = (a: UserAddress) => {
    setEditingAddress(a.id)
    setAddrForm({ label: a.label, name: a.name, phone: a.phone, address: a.address, city: a.city })
    setShowAddressForm(true)
  }

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingAddress ? `/api/user/addresses/${editingAddress}` : '/api/user/addresses'
    const method = editingAddress ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addrForm) })
    if (res.ok) {
      setShowAddressForm(false)
      const updated = await fetch('/api/user/addresses').then(r => r.json())
      setAddresses(updated)
    }
  }

  const deleteAddress = async (id: string) => {
    await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const setDefault = async (id: string) => {
    await fetch(`/api/user/addresses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDefault: true }) })
    const updated = await fetch('/api/user/addresses').then(r => r.json())
    setAddresses(updated)
  }

  if (loaded && !isLoggedIn) return null

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold text-slate-900">{t('account_title', lang)}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-2xl font-black text-brand-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                <p className="text-[12px] text-slate-500">{user?.username}</p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/login') }}
              className="px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all">
              {lang === 'id' ? 'Keluar' : 'Logout'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'id' ? 'Alamat Tersimpan' : 'Saved Addresses'}
            </h3>
            <button onClick={openNewAddress}
              className="px-4 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all">
              + {lang === 'id' ? 'Tambah' : 'Add'}
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={saveAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Label' : 'Label'}</label>
                  <input value={addrForm.label} onChange={e => setAddrForm({...addrForm, label: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" placeholder="Rumah / Kantor" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Nama Penerima' : 'Recipient Name'} *</label>
                  <input value={addrForm.name} onChange={e => setAddrForm({...addrForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'No. HP' : 'Phone'} *</label>
                  <input value={addrForm.phone} onChange={e => setAddrForm({...addrForm, phone: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Kota' : 'City'}</label>
                  <input value={addrForm.city} onChange={e => setAddrForm({...addrForm, city: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Alamat' : 'Address'} *</label>
                  <textarea value={addrForm.address} onChange={e => setAddrForm({...addrForm, address: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] resize-none" rows={2} required />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600">
                  {lang === 'id' ? 'Simpan' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)}
                  className="px-5 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 && !showAddressForm ? (
            <p className="text-slate-400 text-[13px] text-center py-4">
              {lang === 'id' ? 'Belum ada alamat tersimpan' : 'No saved addresses'}
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map(a => (
                <div key={a.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {editingAddress === a.id && showAddressForm ? null : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-bold text-slate-900">{a.label}</span>
                          {a.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{lang === 'id' ? 'Utama' : 'Default'}</span>
                          )}
                        </div>
                        <p className="text-[12px] text-slate-700">{a.name} — {a.phone}</p>
                        <p className="text-[12px] text-slate-500">{a.address}, {a.city}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!a.isDefault && (
                          <button onClick={() => setDefault(a.id)}
                            className="text-[10px] font-bold text-sky-600 hover:text-sky-700">{lang === 'id' ? 'Utamakan' : 'Set Default'}</button>
                        )}
                        <button onClick={() => openEditAddress(a)}
                          className="text-[10px] font-bold text-brand-primary hover:text-sky-700">{lang === 'id' ? 'Edit' : 'Edit'}</button>
                        <button onClick={() => deleteAddress(a.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            {lang === 'id' ? 'Riwayat Pesanan' : 'Order History'}
          </h3>

          {myOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">{lang === 'id' ? 'Belum ada pesanan' : 'No orders yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div key={order.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-slate-900 text-[12px]">{order.id}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'shipping' ? 'bg-sky-100 text-sky-700' :
                      order.status === 'to_ship' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'paid' ? (lang === 'id' ? 'Dibayar' : 'Paid')
                        : order.status === 'completed' ? (lang === 'id' ? 'Selesai' : 'Completed')
                        : order.status === 'shipping' ? (lang === 'id' ? 'Dikirim' : 'Shipping')
                        : order.status === 'to_ship' ? (lang === 'id' ? 'Siap Dikirim' : 'To Ship')
                        : order.status === 'cancelled' ? (lang === 'id' ? 'Dibatalkan' : 'Cancelled')
                        : (lang === 'id' ? 'Menunggu Pembayaran' : 'Waiting Payment')}
                    </span>
                  </div>
                  <div className="space-y-2 text-[12px] text-slate-600">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{lang === 'id' ? item.name_id : item.name_en} × {item.qty}</span>
                        <span className="font-semibold">{formatPrice(item.price_idr * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between text-[13px]">
                    <span className="font-bold text-slate-900">{lang === 'id' ? 'Total' : 'Total'}</span>
                    <span className="font-bold text-brand-primary">{formatPrice(order.total)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    {new Date(order.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {testingMode && order.status === 'waiting_payment' && (
                    <button
                      onClick={() => handleMarkPaid(order.id)}
                      disabled={processingOrderId === order.id}
                      className="mt-3 w-full py-2 bg-orange-500 text-white text-[11px] font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                    >
                      {processingOrderId === order.id
                        ? (lang === 'id' ? 'Memproses...' : 'Processing...')
                        : (lang === 'id' ? '🧪 Tandai Dibayar' : '🧪 Mark as Paid')}
                    </button>
                  )}
                  {testingMode && order.status === 'shipping' && (
                    <button
                      onClick={() => handleMarkCompleted(order.id)}
                      disabled={processingOrderId === order.id}
                      className="mt-3 w-full py-2 bg-emerald-500 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                      {processingOrderId === order.id
                        ? (lang === 'id' ? 'Memproses...' : 'Processing...')
                        : (lang === 'id' ? '🧪 Tandai Sampai' : '🧪 Mark as Arrived')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
