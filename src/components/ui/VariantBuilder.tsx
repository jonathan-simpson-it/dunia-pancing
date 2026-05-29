'use client'

import { useState, useMemo } from 'react'
import { useLang } from '../../context/LanguageContext'
import type { VariantType, ProductVariant } from '../../types'

interface VariantBuilderProps {
  variantTypes: VariantType[]
  variants: ProductVariant[]
  onChange: (variantTypes: VariantType[], variants: ProductVariant[]) => void
}

let vtCounter = 0
let vvCounter = 0
let pvCounter = 0

function newVtId() { return 'vt-' + (++vtCounter) }
function newVvId() { return 'vv-' + (++vvCounter) }
function newPvId() { return 'pv-' + (++pvCounter) }

function generateCombinations(variantTypes: VariantType[]): Record<string, string>[] {
  if (variantTypes.length === 0) return []

  const valueLists = variantTypes.map(vt => ({
    typeId: vt.id,
    values: vt.values.map(v => v.id),
  }))

  function cartesian(arrays: { typeId: string; values: string[] }[], idx: number): Record<string, string>[] {
    if (idx >= arrays.length) return [{}]
    const rest = cartesian(arrays, idx + 1)
    const result: Record<string, string>[] = []
    for (const val of arrays[idx].values) {
      for (const r of rest) {
        result.push({ ...r, [arrays[idx].typeId]: val })
      }
    }
    return result
  }

  return cartesian(valueLists, 0)
}

export default function VariantBuilder({ variantTypes, variants, onChange }: VariantBuilderProps) {
  const { lang } = useLang()
  const [newTypeName, setNewTypeName] = useState('')
  const [newValueLabels, setNewValueLabels] = useState<Record<string, string>>({})
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  const combinations = useMemo(() => generateCombinations(variantTypes), [variantTypes])

  const getVariantLabel = (combination: Record<string, string>) => {
    return variantTypes.map(vt => {
      const val = vt.values.find(v => v.id === combination[vt.id])
      return val ? val.label : '?'
    }).join(' / ')
  }

  const getOrCreateVariant = (combination: Record<string, string>): ProductVariant => {
    const existing = variants.find(v =>
      Object.entries(combination).every(([k, val]) => v.combination[k] === val)
    )
    if (existing) return existing
    return {
      id: newPvId(),
      sku: '',
      combination,
      price_idr: 0,
      stock_qty: 0,
    }
  }

  const updateVariantField = (combination: Record<string, string>, field: string, value: any) => {
    const existing = variants.find(v =>
      Object.entries(combination).every(([k, val]) => v.combination[k] === val)
    )
    if (existing) {
      onChange(variantTypes, variants.map(v =>
        Object.entries(combination).every(([k, val]) => v.combination[k] === val)
          ? { ...v, [field]: value }
          : v
      ))
    } else {
      onChange(variantTypes, [...variants, {
        id: newPvId(),
        sku: '',
        combination,
        price_idr: field === 'price_idr' ? Number(value) : 0,
        stock_qty: field === 'stock_qty' ? Number(value) : 0,
        [field]: value,
      } as ProductVariant])
    }
  }

  const addType = () => {
    if (!newTypeName.trim()) return
    const id = newVtId()
    onChange(
      [...variantTypes, { id, name: newTypeName.trim(), values: [] }],
      variants
    )
    setNewTypeName('')
    setExpandedType(id)
  }

  const removeType = (typeId: string) => {
    const updatedTypes = variantTypes.filter(vt => vt.id !== typeId)
    const updatedVariants = variants.filter(v => !v.combination[typeId])
    onChange(updatedTypes, updatedVariants)
  }

  const addValue = (typeId: string) => {
    const label = (newValueLabels[typeId] || '').trim()
    if (!label) return
    const id = newVvId()
    onChange(
      variantTypes.map(vt =>
        vt.id === typeId ? { ...vt, values: [...vt.values, { id, label }] } : vt
      ),
      variants
    )
    setNewValueLabels(prev => ({ ...prev, [typeId]: '' }))
  }

  const removeValue = (typeId: string, valueId: string) => {
    const updatedTypes = variantTypes.map(vt =>
      vt.id === typeId ? { ...vt, values: vt.values.filter(v => v.id !== valueId) } : vt
    )
    const valLabel = variantTypes.find(vt => vt.id === typeId)?.values.find(v => v.id === valueId)?.label
    const updatedVariants = variants.filter(v => v.combination[typeId] !== valueId)
    onChange(updatedTypes, updatedVariants)
  }

  const applyBulkPrice = () => {
    const price = Number(bulkPrice)
    if (!price) return
    const updatedVariants = combinations.map(combo => {
      const existing = variants.find(v =>
        Object.entries(combo).every(([k, val]) => v.combination[k] === val)
      )
      return existing
        ? { ...existing, price_idr: price }
        : { id: newPvId(), sku: '', combination: combo, price_idr: price, stock_qty: 0 }
    })
    onChange(variantTypes, updatedVariants)
  }

  const applyBulkStock = () => {
    const stock = Number(bulkStock)
    if (!stock && stock !== 0) return
    const updatedVariants = combinations.map(combo => {
      const existing = variants.find(v =>
        Object.entries(combo).every(([k, val]) => v.combination[k] === val)
      )
      return existing
        ? { ...existing, stock_qty: stock }
        : { id: newPvId(), sku: '', combination: combo, price_idr: 0, stock_qty: stock }
    })
    onChange(variantTypes, updatedVariants)
  }

  const removeAllVariants = () => {
    onChange(variantTypes, [])
  }

  return (
    <div className="space-y-5 border-t border-slate-100 pt-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-slate-900">
          {lang === 'id' ? 'Varian Produk' : 'Product Variants'}
        </h3>
        {variantTypes.length > 0 && variants.length > 0 && (
          <button type="button" onClick={removeAllVariants} className="text-[11px] text-red-500 hover:text-red-700 font-semibold">
            {lang === 'id' ? 'Hapus Semua Varian' : 'Remove All Variants'}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newTypeName}
          onChange={e => setNewTypeName(e.target.value)}
          placeholder={lang === 'id' ? 'Nama tipe varian...' : 'Variant type name...'}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addType())}
        />
        <button type="button" onClick={addType} className="px-4 py-2 bg-brand-primary text-white text-[12px] font-bold rounded-lg hover:bg-sky-600 transition-all">
          + {lang === 'id' ? 'Tambah Tipe' : 'Add Type'}
        </button>
      </div>

      {variantTypes.length > 0 && (
        <div className="space-y-3">
          {variantTypes.map(vt => (
            <div key={vt.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900">{vt.name}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{vt.values.length} {lang === 'id' ? 'nilai' : 'values'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedType(expandedType === vt.id ? null : vt.id)}
                    className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-all"
                  >
                    {expandedType === vt.id ? (lang === 'id' ? 'Tutup' : 'Collapse') : (lang === 'id' ? 'Atur Nilai' : 'Edit Values')}
                  </button>
                  <button type="button" onClick={() => removeType(vt.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {vt.values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {vt.values.map(val => (
                    <span key={val.id} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {val.label}
                      {val.metadata && Object.entries(val.metadata).map(([k, v]) => (
                        <span key={k} className="text-[9px] text-slate-400 ml-0.5">({k}: {v})</span>
                      ))}
                      <button type="button" onClick={() => removeValue(vt.id, val.id)} className="ml-0.5 text-slate-300 hover:text-red-500">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {expandedType === vt.id && (
                <div className="flex gap-2">
                  <input
                    value={newValueLabels[vt.id] || ''}
                    onChange={e => setNewValueLabels(prev => ({ ...prev, [vt.id]: e.target.value }))}
                    placeholder={lang === 'id' ? 'Nilai varian...' : 'Variant value...'}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addValue(vt.id) }
                    }}
                  />
                  <button type="button" onClick={() => addValue(vt.id)} className="px-3 py-1.5 bg-white border border-brand-primary text-brand-primary text-[11px] font-bold rounded-lg hover:bg-brand-primary/5 transition-all">
                    + {lang === 'id' ? 'Tambah' : 'Add'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {combinations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[12px] font-bold text-slate-700">
              {lang === 'id' ? 'Kombinasi Varian' : 'Variant Combinations'}
              <span className="ml-1.5 text-slate-400 font-normal">({combinations.length})</span>
            </h4>
            <div className="flex items-center gap-2">
              <input
                value={bulkPrice}
                onChange={e => setBulkPrice(e.target.value)}
                type="number"
                placeholder={lang === 'id' ? 'Harga massal' : 'Bulk price'}
                className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <button type="button" onClick={applyBulkPrice} className="px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
                {lang === 'id' ? 'Terapkan Harga' : 'Set Price'}
              </button>
              <input
                value={bulkStock}
                onChange={e => setBulkStock(e.target.value)}
                type="number"
                placeholder={lang === 'id' ? 'Stok massal' : 'Bulk stock'}
                className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <button type="button" onClick={applyBulkStock} className="px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
                {lang === 'id' ? 'Terapkan Stok' : 'Set Stock'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Varian' : 'Variant'}</th>
                  <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Harga' : 'Price'} (Rp)</th>
                  <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Stok' : 'Stock'}</th>
                  <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wider">{lang === 'id' ? 'Berat' : 'Weight'} (g)</th>
                </tr>
              </thead>
              <tbody>
                {combinations.map((combo, i) => {
                  const v = getOrCreateVariant(combo)
                  return (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">{getVariantLabel(combo)}</td>
                      <td className="px-3 py-2">
                        <input
                          value={v.sku}
                          onChange={e => updateVariantField(combo, 'sku', e.target.value)}
                          className="w-20 px-1.5 py-1 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={v.price_idr || ''}
                          onChange={e => updateVariantField(combo, 'price_idr', Number(e.target.value))}
                          type="number"
                          className="w-24 px-1.5 py-1 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={v.stock_qty || ''}
                          onChange={e => updateVariantField(combo, 'stock_qty', Number(e.target.value))}
                          type="number"
                          className="w-16 px-1.5 py-1 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={v.weight || ''}
                          onChange={e => updateVariantField(combo, 'weight', Number(e.target.value))}
                          type="number"
                          className="w-16 px-1.5 py-1 border border-slate-200 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'id' ? 'Isi harga dan stok untuk setiap kombinasi varian. Kosongkan jika tidak tersedia.' : 'Fill price and stock for each variant combination. Leave empty if unavailable.'}
          </p>
        </div>
      )}
    </div>
  )
}
