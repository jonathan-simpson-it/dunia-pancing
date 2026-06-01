'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useProducts } from '../context/ProductStore'
import { useAuth } from '../context/AuthContext'
import { formatIDR } from '../utils/formatters'
import ImageUploader from '../components/ui/ImageUploader'
import VariantBuilder from '../components/ui/VariantBuilder'
import FeatureEditor from '../components/ui/FeatureEditor'
import type { Product, VariantType, ProductVariant, ProductFeature } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function AdminDashboard() {
  const { lang } = useLang()
  const { products, deleteProduct, updateProduct, categories, addCategory, renameCategory, deleteCategory } = useProducts()
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [showVariantEditor, setShowVariantEditor] = useState<string | null>(null)
  const [showFeatureEditor, setShowFeatureEditor] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('products')

  const [showAddCat, setShowAddCat] = useState(false)
  const [catForm, setCatForm] = useState({ key: '', name_id: '', name_en: '', icon: '' })
  const [catError, setCatError] = useState('')
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatForm, setEditCatForm] = useState({ name_id: '', name_en: '', icon: '' })
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(p =>
      p.name_id.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    )
  }, [products, search])

  const sidebarLinks = [
    { key: 'products', label_id: 'Produk', label_en: 'Products', icon: '📦' },
    { key: 'categories', label_id: 'Kategori', label_en: 'Categories', icon: '🏷️' },
    { to: '/admin/orders', label_id: 'Pesanan', label_en: 'Orders', icon: '📋', isLink: true as const },
    { to: '/admin/add', label_id: 'Tambah Produk', label_en: 'Add Product', icon: '➕', isLink: true as const },
    { to: '/admin/import', label_id: 'Import Harga', label_en: 'Price Import', icon: '📥', isLink: true as const },
    { to: '/admin/revenue', label_id: 'Pendapatan', label_en: 'Revenue', icon: '💰', isLink: true as const },
  ]

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      name_id: product.name_id,
      name_en: product.name_en,
      price_idr: product.price_idr,
      original_price_idr: product.original_price_idr || product.price_idr,
      stock_qty: product.stock_qty || 0,
      brand: product.brand,
      category: product.category,
      images: product.images || [product.image].filter(Boolean),
      shippingEstimateMin: product.shippingEstimateDays?.min || 3,
      shippingEstimateMax: product.shippingEstimateDays?.max || 7,
    })
  }

  const saveEdit = async (id: string) => {
    const images = editForm.images || []
    const product = products.find(p => p.id === id)
    const updates = {
      ...editForm,
      price_idr: Number(editForm.price_idr),
      original_price_idr: Number(editForm.original_price_idr) || Number(editForm.price_idr),
      stock_qty: Number(editForm.stock_qty),
      images,
      image: images[0] || '',
      shippingEstimateDays: {
        min: Number(editForm.shippingEstimateMin) || 3,
        max: Number(editForm.shippingEstimateMax) || 7,
      },
    }
    updateProduct(id, updates)
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          variantTypes: product?.variantTypes || [],
          variants: product?.variants || [],
        }),
      })
    } catch (err) {
      console.error('Failed to sync edit to DB:', err)
    }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    deleteProduct(id)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete from DB:', err)
    }
    setConfirmDelete(null)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatError('')
    const key = catForm.key.trim().toLowerCase().replace(/\s+/g, '_')
    const ok = addCategory({ key, name_id: catForm.name_id.trim(), name_en: catForm.name_en.trim() || catForm.name_id.trim(), icon: catForm.icon.trim() || '📦' })
    if (!ok) {
      setCatError(lang === 'id' ? 'Kategori dengan key tersebut sudah ada' : 'Category with this key already exists')
      return
    }
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, nameId: catForm.name_id.trim(), nameEn: catForm.name_en.trim() || catForm.name_id.trim(), icon: catForm.icon.trim() || '📦' }),
      })
    } catch (err) {
      console.error('Failed to sync category to DB:', err)
    }
    setShowAddCat(false)
    setCatForm({ key: '', name_id: '', name_en: '', icon: '' })
  }

  const startEditCat = (cat: { key: string; name_id: string; name_en: string; icon?: string }) => {
    setEditingCat(cat.key)
    setEditCatForm({ name_id: cat.name_id, name_en: cat.name_en, icon: cat.icon || '' })
  }

  const saveEditCat = async (key: string) => {
    renameCategory(key, {
      name_id: editCatForm.name_id.trim(),
      name_en: editCatForm.name_en.trim() || editCatForm.name_id.trim(),
      icon: editCatForm.icon.trim() || '📦',
    })
    try {
      await fetch(`/api/categories/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameId: editCatForm.name_id.trim(),
          nameEn: editCatForm.name_en.trim() || editCatForm.name_id.trim(),
          icon: editCatForm.icon.trim() || '📦',
        }),
      })
    } catch (err) {
      console.error('Failed to sync category edit to DB:', err)
    }
    setEditingCat(null)
  }

  const handleDeleteCat = async (key: string) => {
    const ok = deleteCategory(key)
    if (!ok) {
      setCatError(lang === 'id' ? 'Tidak bisa menghapus kategori yang masih memiliki produk' : 'Cannot delete category with existing products')
      setTimeout(() => setCatError(''), 3000)
    }
    try {
      await fetch(`/api/categories/${key}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to sync category delete to DB:', err)
    }
    setCatDeleteConfirm(null)
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}>
          📦 {lang === 'id' ? 'Produk' : 'Products'}
        </button>
        <button onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}>
          🏷️ {lang === 'id' ? 'Kategori' : 'Categories'}
        </button>
      </div>

      {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{lang === 'id' ? 'Produk' : 'Products'}</h2>
                    <p className="text-[11px] text-slate-500">{products.length} {lang === 'id' ? 'produk' : 'products'}</p>
                  </div>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={lang === 'id' ? 'Cari produk...' : 'Search products...'}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-full sm:w-64" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Nama' : 'Name'}</th>
                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                        <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Harga' : 'Price'}</th>
                        <th className="text-center px-4 py-3 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">{lang === 'id' ? 'Stok' : 'Stock'}</th>
                        <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Aksi' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-[13px]">
                            {lang === 'id' ? 'Tidak ada produk' : 'No products found'}
                          </td>
                        </tr>
                      ) : filtered.flatMap(p => {
                        const rows: React.ReactNode[] = []
                        rows.push(
                          <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                            {editingId === p.id ? (
                              <>
                                <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{p.id}</td>
                                <td className="px-4 py-3">
                                  <input value={editForm.name_id || ''} onChange={e => setEditForm({...editForm, name_id: e.target.value})} className="w-full px-2 py-1 border border-slate-200 rounded text-[11px]" />
                                  <input value={editForm.name_en || ''} onChange={e => setEditForm({...editForm, name_en: e.target.value})} className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] mt-1" />
                                  {editForm.images && editForm.images.length > 0 && (
                                    <div className="mt-2 flex items-center gap-1">
                                      {editForm.images.map((url: string, i: number) => (
                                        <img key={i} src={url} alt="" className="w-8 h-8 rounded object-cover bg-slate-50 border border-slate-200" />
                                      ))}
                                      <span className="text-[9px] text-slate-400 ml-1">{editForm.images.length} {lang === 'id' ? 'gambar' : 'images'}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  <select value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} className="px-2 py-1 border border-slate-200 rounded text-[11px]">
                                    {categories.map(c => <option key={c.key} value={c.key}>{c.name_id}</option>)}
                                  </select>
                                  <input value={editForm.brand || ''} onChange={e => setEditForm({...editForm, brand: e.target.value})} className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] mt-1" placeholder="Brand" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <input value={editForm.price_idr || ''} onChange={e => setEditForm({...editForm, price_idr: e.target.value})} className="w-24 px-2 py-1 border border-slate-200 rounded text-[11px] text-right" />
                                </td>
                                <td className="px-4 py-3 text-center hidden sm:table-cell">
                                  <input value={editForm.stock_qty || ''} onChange={e => setEditForm({...editForm, stock_qty: e.target.value})} className="w-16 px-2 py-1 border border-slate-200 rounded text-[11px] text-center" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => saveEdit(p.id)} className="text-emerald-600 font-bold text-[11px] hover:text-emerald-700 mr-3">{lang === 'id' ? 'Simpan' : 'Save'}</button>
                                  <button onClick={() => setEditingId(null)} className="text-slate-400 font-bold text-[11px] hover:text-slate-600">{lang === 'id' ? 'Batal' : 'Cancel'}</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{p.id}</td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name_id}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{p.brand}</div>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded capitalize">{p.category}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                  {formatIDR(p.price_idr)}
                                  {p.original_price_idr > p.price_idr && (
                                    <div className="text-[10px] text-slate-400 line-through font-normal">{formatIDR(p.original_price_idr)}</div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center hidden sm:table-cell">
                                  <span className={`text-[11px] font-semibold ${p.stock_qty > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{p.stock_qty || 0}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => startEdit(p)} className="text-brand-primary font-bold text-[11px] hover:text-sky-700 mr-2">Edit</button>
                                  <button onClick={() => setShowVariantEditor(showVariantEditor === p.id ? null : p.id)} className="text-sky-600 font-bold text-[11px] hover:text-sky-800 mr-2">
                                    {lang === 'id' ? 'Varian' : 'Variants'}
                                  </button>
                                  <button onClick={() => setShowFeatureEditor(showFeatureEditor === p.id ? null : p.id)} className="text-emerald-600 font-bold text-[11px] hover:text-emerald-800 mr-2">
                                    {lang === 'id' ? 'Fitur' : 'Features'}
                                  </button>
                                  {confirmDelete === p.id ? (
                                    <>
                                      <button onClick={() => handleDelete(p.id)} className="text-red-500 font-bold text-[11px] hover:text-red-700 mr-2">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                                      <button onClick={() => setConfirmDelete(null)} className="text-slate-400 font-bold text-[11px]">{lang === 'id' ? 'Batal' : 'No'}</button>
                                    </>
                                  ) : (
                                    <button onClick={() => setConfirmDelete(p.id)} className="text-slate-400 font-bold text-[11px] hover:text-red-500">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        )
                        if (showVariantEditor === p.id) {
                          rows.push(
                            <tr key={p.id + '-variants'}>
                              <td colSpan={6} className="px-4 py-4 bg-sky-50/30 border-t border-sky-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[12px] font-bold text-sky-700">
                                    {lang === 'id' ? 'Varian:' : 'Variants:'} {p.name_id}
                                  </span>
                                  <button type="button" onClick={() => setShowVariantEditor(null)} className="text-[10px] text-slate-400 hover:text-slate-600">
                                    {lang === 'id' ? 'Tutup' : 'Close'}
                                  </button>
                                </div>
                                <VariantBuilder
                                  variantTypes={p.variantTypes || []}
                                  variants={p.variants || []}
                                  onChange={async (newTypes, newVariants) => {
                                    updateProduct(p.id, { variantTypes: newTypes, variants: newVariants })
                                    try {
                                      await fetch(`/api/products/${p.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          nameId: p.name_id,
                                          nameEn: p.name_en,
                                          priceIdr: p.price_idr,
                                          stockQty: p.stock_qty,
                                          inStock: p.in_stock,
                                          category: p.category,
                                          brand: p.brand,
                                          image: p.image,
                                          images: p.images,
                                          variantTypes: newTypes,
                                          variants: newVariants,
                                        }),
                                      })
                                    } catch (err) {
                                      console.error('Failed to sync variants to DB:', err)
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          )
                        }
                        if (showFeatureEditor === p.id) {
                          rows.push(
                            <tr key={p.id + '-features'}>
                              <td colSpan={6} className="px-4 py-4 bg-emerald-50/30 border-t border-emerald-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[12px] font-bold text-emerald-700">
                                    {lang === 'id' ? 'Fitur:' : 'Features:'} {p.name_id}
                                  </span>
                                  <button type="button" onClick={() => setShowFeatureEditor(null)} className="text-[10px] text-slate-400 hover:text-slate-600">
                                    {lang === 'id' ? 'Tutup' : 'Close'}
                                  </button>
                                </div>
                                <FeatureEditor
                                  features={p.features || []}
                                  onChange={(newFeatures) => {
                                    updateProduct(p.id, { features: newFeatures })
                                  }}
                                />
                              </td>
                            </tr>
                          )
                        }
                        return rows
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{lang === 'id' ? 'Kategori' : 'Categories'}</h2>
                    <p className="text-[11px] text-slate-500">{categories.length} {lang === 'id' ? 'kategori' : 'categories'}</p>
                  </div>
                  <button onClick={() => setShowAddCat(!showAddCat)}
                    className="px-4 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all flex items-center gap-1.5">
                    <span>+</span>
                    <span>{lang === 'id' ? 'Tambah' : 'Add'}</span>
                  </button>
                </div>

                {catError && (
                  <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium rounded-lg">{catError}</div>
                )}

                {showAddCat && (
                  <form onSubmit={handleAddCategory} className="mx-5 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Key (slug)' : 'Key (slug)'} *</label>
                        <input value={catForm.key} onChange={e => setCatForm({...catForm, key: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Nama (Indonesia)' : 'Name (Indonesia)'} *</label>
                        <input value={catForm.name_id} onChange={e => setCatForm({...catForm, name_id: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{lang === 'id' ? 'Nama (English)' : 'Name (English)'}</label>
                        <input value={catForm.name_en} onChange={e => setCatForm({...catForm, name_en: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Icon (emoji)</label>
                        <input value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} placeholder="🎣"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="px-5 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all">
                        {lang === 'id' ? 'Simpan' : 'Save'}
                      </button>
                      <button type="button" onClick={() => { setShowAddCat(false); setCatError('') }}
                        className="px-5 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                        {t('admin_cancel', lang)}
                      </button>
                    </div>
                  </form>
                )}

                <div className="p-5">
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat.key} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xl shrink-0">{cat.icon || '📦'}</span>
                        {editingCat === cat.key ? (
                          <div className="flex-1 flex flex-wrap items-center gap-2">
                            <input value={editCatForm.name_id} onChange={e => setEditCatForm({...editCatForm, name_id: e.target.value})}
                              className="px-2 py-1 border border-slate-200 rounded text-[12px] w-32" />
                            <input value={editCatForm.name_en} onChange={e => setEditCatForm({...editCatForm, name_en: e.target.value})}
                              className="px-2 py-1 border border-slate-200 rounded text-[12px] w-32" />
                            <input value={editCatForm.icon} onChange={e => setEditCatForm({...editCatForm, icon: e.target.value})}
                              className="px-2 py-1 border border-slate-200 rounded text-[12px] w-16 text-center" placeholder="🎣" />
                            <button onClick={() => saveEditCat(cat.key)} className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-600">{lang === 'id' ? 'Simpan' : 'Save'}</button>
                            <button onClick={() => setEditingCat(null)} className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600">{lang === 'id' ? 'Batal' : 'Cancel'}</button>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900">{cat.name_id}</div>
                            <div className="text-[11px] text-slate-500">
                              <span className="font-mono text-slate-400">{cat.key}</span>
                              <span className="mx-1.5">·</span>
                              <span>{cat.name_en}</span>
                              <span className="mx-1.5">·</span>
                              <span className="text-slate-400">{products.filter(p => p.category === cat.key).length} {lang === 'id' ? 'produk' : 'products'}</span>
                            </div>
                          </div>
                        )}
                        {editingCat !== cat.key && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => startEditCat(cat)} className="px-3 py-1.5 text-[11px] font-bold text-brand-primary hover:bg-sky-50 rounded-lg transition-all">Edit</button>
                            {catDeleteConfirm === cat.key ? (
                              <>
                                <button onClick={() => handleDeleteCat(cat.key)} className="px-3 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                                <button onClick={() => setCatDeleteConfirm(null)} className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-slate-50 rounded-lg">{lang === 'id' ? 'Batal' : 'No'}</button>
                              </>
                            ) : (
                              <button onClick={() => setCatDeleteConfirm(cat.key)} className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
    </>
  )
}
