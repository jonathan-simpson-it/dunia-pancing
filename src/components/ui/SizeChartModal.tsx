'use client'

import { useLang } from '../../context/LanguageContext'
import type { SizeChartEntry } from '../../types'

interface SizeChartModalProps {
  open: boolean
  onClose: () => void
  entries: SizeChartEntry[]
  title?: string
}

export default function SizeChartModal({ open, onClose, entries, title }: SizeChartModalProps) {
  const { lang } = useLang()

  if (!open || !entries || entries.length === 0) return null

  const keys = Object.keys(entries[0].values)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            {title || (lang === 'id' ? 'Tabel Ukuran' : 'Size Chart')}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  {lang === 'id' ? 'Ukuran' : 'Size'}
                </th>
                {keys.map(k => (
                  <th key={k} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 border-b border-slate-100">
                    {entry.label}
                  </td>
                  {keys.map(k => (
                    <td key={k} className="px-4 py-2.5 text-slate-600 border-b border-slate-100">
                      {entry.values[k] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
