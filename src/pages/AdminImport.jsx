import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useProducts } from '../context/ProductStore'
import { useAuth } from '../context/AuthContext'
import * as XLSX from 'xlsx'
import MetaTags from '../components/seo/MetaTags'
import { formatIDR } from '../utils/formatters'
import id from '../locales/id.json'
import en from '../locales/en.json'

const t = (key, lang) => lang === 'id' ? id[key] : en[key]

export default function AdminImport() {
  const { lang } = useLang()
  const { products, importPrices } = useProducts()
  const { user, logout } = useAuth()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  const handleFile = useCallback((file) => {
    setError('')
    setApplied(false)
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError(lang === 'id' ? 'Format file tidak didukung. Gunakan CSV atau Excel.' : 'Unsupported file format. Use CSV or Excel.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(lang === 'id' ? 'Ukuran file maksimal 5MB' : 'Maximum file size is 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (json.length === 0) {
          setError(lang === 'id' ? 'File kosong' : 'File is empty')
          return
        }

        const parsed = json.map(row => {
          const id = String(row.id || row.ID || row.Id || '').trim()
          const name = String(row.name || row.Name || row.nama || row.Nama || '').trim()
          const price = Number(row.price_idr || row.price || row.Price || row.harga || row.Harga || 0)
          return { id, name, price_idr: isNaN(price) ? 0 : price }
        }).filter(p => p.price_idr > 0)

        if (parsed.length === 0) {
          setError(lang === 'id' ? 'Tidak ada data harga yang valid. Pastikan kolom "id" atau "name" dan kolom harga ada.' : 'No valid price data found. Make sure "id" or "name" column and a price column exist.')
          return
        }

        const matched = parsed.map(up => {
          const prod = products.find(p => p.id === up.id || p.name_id.toLowerCase().includes(up.name.toLowerCase()))
          return {
            ...up,
            found: !!prod,
            oldPrice: prod ? prod.price_idr : null,
            productName: prod ? prod.name_id : (up.name || up.id),
          }
        })

        setPreview(matched)
      } catch (err) {
        setError(lang === 'id' ? 'Gagal membaca file: ' + err.message : 'Failed to read file: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }, [products, lang])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleFileSelect = (e) => {
    handleFile(e.target.files[0])
  }

  const handleApply = () => {
    if (!preview) return
    const updates = preview.map(p => ({ id: p.id, name: p.name, price_idr: p.price_idr }))
    importPrices(updates)
    setApplied(true)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const downloadTemplate = (format) => {
    const template = [
      { id: 'dp-001', name_id: 'Joran Shikari Warrior', price_idr: 85000 },
      { id: 'dp-005', name_id: 'Reel Shimano Sienna', price_idr: 485000 },
    ]

    if (format === 'csv') {
      const header = 'id,name_id,price_idr\n'
      const rows = template.map(p => `${p.id},${p.name_id},${p.price_idr}`).join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'template-update-harga.csv'; a.click()
      URL.revokeObjectURL(url)
    } else {
      const ws = XLSX.utils.json_to_sheet(template)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Harga')
      XLSX.writeFile(wb, 'template-update-harga.xlsx')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title={`${t('admin_import', lang)} — Admin`} />

      <div className="max-w-4xl mx-auto px-4 pt-28">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-2">
            <div className="px-4 py-3 border-b border-slate-50">
              <div className="text-sm font-bold text-slate-900">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Panel</div>
            </div>
            <div className="p-2 space-y-0.5">
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <span>📦</span><span>{t('admin_products', lang)}</span>
              </Link>
              <Link to="/admin/add" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <span>➕</span><span>{t('admin_add_product', lang)}</span>
              </Link>
              <Link to="/admin/import" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold bg-brand-primary text-white transition-all">
                <span>📥</span><span>{t('admin_import', lang)}</span>
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all mt-2">
                <span>🚪</span><span>{t('admin_logout', lang)}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-2">{t('admin_import_title', lang)}</h2>
          <p className="text-[12px] text-slate-500 mb-6">{t('admin_import_desc', lang)}</p>

          {/* Template Download */}
          <div className="flex gap-3 mb-6">
            <button onClick={() => downloadTemplate('csv')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {lang === 'id' ? 'Download Template CSV' : 'Download CSV Template'}
            </button>
            <button onClick={() => downloadTemplate('xlsx')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-[12px] font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {lang === 'id' ? 'Download Template Excel' : 'Download Excel Template'}
            </button>
          </div>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? 'border-brand-primary bg-sky-50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {lang === 'id' ? 'Seret file CSV/Excel ke sini' : 'Drag CSV/Excel file here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'id' ? 'atau klik untuk memilih file (maks. 5MB)' : 'or click to select (max 5MB)'}
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium rounded-lg">
              {error}
            </div>
          )}

          {applied && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl">
              ✅ {lang === 'id' ? 'Harga berhasil diperbarui!' : 'Prices updated successfully!'}
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                {lang === 'id' ? 'Preview Perubahan Harga' : 'Price Change Preview'}
                <span className="ml-2 text-[11px] font-normal text-slate-400">
                  {preview.filter(p => p.found).length} {lang === 'id' ? 'produk akan diperbarui' : 'products to update'}
                </span>
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-2.5 font-bold text-slate-500">ID / {lang === 'id' ? 'Nama' : 'Name'}</th>
                      <th className="text-right px-4 py-2.5 font-bold text-slate-500">{lang === 'id' ? 'Status' : 'Status'}</th>
                      <th className="text-right px-4 py-2.5 font-bold text-slate-500">{lang === 'id' ? 'Harga Lama' : 'Old Price'}</th>
                      <th className="text-right px-4 py-2.5 font-bold text-slate-500">{lang === 'id' ? 'Harga Baru' : 'New Price'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p, i) => (
                      <tr key={i} className={`border-t border-slate-50 ${!p.found ? 'bg-red-50' : p.oldPrice !== p.price_idr ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-2.5 font-medium text-slate-900">{p.productName || p.id || p.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          {p.found ? (
                            p.oldPrice !== p.price_idr
                              ? <span className="text-yellow-700 font-semibold text-[11px]">{lang === 'id' ? 'Berubah' : 'Changed'}</span>
                              : <span className="text-slate-400 text-[11px]">{lang === 'id' ? 'Sama' : 'Same'}</span>
                          ) : (
                            <span className="text-red-500 font-semibold text-[11px]">{lang === 'id' ? 'Tidak ditemukan' : 'Not found'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-500">{p.oldPrice ? formatIDR(p.oldPrice) : '-'}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatIDR(p.price_idr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  {t('admin_cancel', lang)}
                </button>
                <button onClick={handleApply}
                  className="px-8 py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20">
                  {lang === 'id' ? 'Terapkan Perubahan' : 'Apply Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
