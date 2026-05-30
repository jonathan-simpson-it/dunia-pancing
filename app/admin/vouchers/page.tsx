'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/context/LanguageContext'
import id from '@/locales/id.json'
import en from '@/locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface Voucher {
  id: string
  code: string
  type: string
  value: number
  minSpend: number | null
  maxUses: number | null
  currentUses: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminVouchers() {
  const { lang } = useLang()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minSpend: '',
    maxUses: '',
    expiresAt: '',
  })

  useEffect(() => {
    fetch('/api/vouchers')
      .then(r => r.json())
      .then(setVouchers)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const v = await res.json()
      setVouchers(prev => [v, ...prev])
      setShowForm(false)
      setForm({ code: '', type: 'PERCENTAGE', value: '', minSpend: '', maxUses: '', expiresAt: '' })
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/vouchers/${id}`, { method: 'DELETE' })
    if (res.ok) setVouchers(prev => prev.filter(v => v.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-slate-900">
          {lang === 'id' ? 'Voucher Diskon' : 'Discount Vouchers'}
        </h2>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all">
          + {lang === 'id' ? 'Buat Voucher' : 'Create Voucher'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-100 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kode</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" required placeholder="DISKON10" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipe</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]">
                <option value="PERCENTAGE">Persen (%)</option>
                <option value="NOMINAL">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nilai</label>
              <input value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" required
                placeholder={form.type === 'PERCENTAGE' ? '10' : '50000'} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Min. Belanja</label>
              <input value={form.minSpend} onChange={e => setForm({...form, minSpend: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" placeholder="0 (optional)" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Maks. Pemakaian</label>
              <input value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" placeholder="0 (unlimited)" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kadaluarsa</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600">
              {lang === 'id' ? 'Simpan' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg">
              {t('admin_cancel', lang)}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">{lang === 'id' ? 'Memuat...' : 'Loading...'}</div>
        ) : vouchers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {lang === 'id' ? 'Belum ada voucher' : 'No vouchers yet'}
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Tipe</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Nilai</th>
                <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Min. Spend</th>
                <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pakai</th>
                <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Aktif</th>
                <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id} className="border-t border-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{v.code}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${v.type === 'PERCENTAGE' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {v.type === 'PERCENTAGE' ? '%' : 'Rp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {v.type === 'PERCENTAGE' ? `${v.value}%` : `Rp${v.value.toLocaleString('id-ID')}`}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-500">
                    {v.minSpend ? `Rp${v.minSpend.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-500">{v.currentUses}/{v.maxUses || '∞'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${v.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 font-bold text-[11px] hover:text-red-700">
                      {lang === 'id' ? 'Hapus' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
