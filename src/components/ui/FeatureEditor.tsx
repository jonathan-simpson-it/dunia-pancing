'use client'

import { useState } from 'react'
import { useLang } from '../../context/LanguageContext'
import type { ProductFeature } from '../../types'

interface FeatureEditorProps {
  features: ProductFeature[]
  onChange: (features: ProductFeature[]) => void
}

export default function FeatureEditor({ features, onChange }: FeatureEditorProps) {
  const { lang } = useLang()
  const [newLabel, setNewLabel] = useState('')
  const [newIcon, setNewIcon] = useState('')

  const addFeature = () => {
    if (!newLabel.trim()) return
    const feature: ProductFeature = {
      id: 'f-' + Date.now(),
      label: newLabel.trim(),
      icon: newIcon.trim() || undefined,
    }
    onChange([...features, feature])
    setNewLabel('')
    setNewIcon('')
  }

  const removeFeature = (id: string) => {
    onChange(features.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-semibold text-slate-700 mb-1">
        {lang === 'id' ? 'Fitur / Lencana' : 'Features / Badges'}
      </label>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map(f => (
            <span key={f.id} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {f.icon && <span>{f.icon}</span>}
              {f.label}
              <button type="button" onClick={() => removeFeature(f.id)} className="ml-0.5 text-slate-300 hover:text-red-500 transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={newIcon}
          onChange={e => setNewIcon(e.target.value)}
          placeholder={lang === 'id' ? 'Ikon' : 'Icon'}
          className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 text-[12px] text-center focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder={lang === 'id' ? 'Label fitur...' : 'Feature label...'}
          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
        />
        <button
          type="button"
          onClick={addFeature}
          className="px-3 py-1.5 bg-brand-primary text-white text-[11px] font-bold rounded-lg hover:bg-sky-600 transition-all shrink-0"
        >
          + {lang === 'id' ? 'Tambah' : 'Add'}
        </button>
      </div>
      <p className="text-[10px] text-slate-400">
        {lang === 'id' ? 'Contoh: Bebas Pengembalian 🔄, Proteksi Kerusakan+ 🛡️' : 'Example: Free Returns 🔄, Damage Protection+ 🛡️'}
      </p>
    </div>
  )
}
