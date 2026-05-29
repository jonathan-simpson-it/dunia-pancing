'use client'

import { useLang } from '../../context/LanguageContext'
import type { VariantType, ProductVariant } from '../../types'

interface VariantSelectorProps {
  variantTypes: VariantType[]
  variants: ProductVariant[]
  selected: Record<string, string>
  onChange: (typeId: string, valueId: string) => void
  getVariantLabel?: (variantTypes: VariantType[], combination: Record<string, string>) => string
}

export default function VariantSelector({
  variantTypes,
  variants,
  selected,
  onChange,
}: VariantSelectorProps) {
  const { lang } = useLang()

  if (!variantTypes || variantTypes.length === 0) return null

  return (
    <div className="space-y-4">
      {variantTypes.map(vt => {
        const selectedVal = selected[vt.id]
        return (
          <div key={vt.id}>
            <div className="text-[12px] font-semibold text-slate-700 mb-2">
              {vt.name}: <span className="font-bold text-slate-900">{vt.values.find(v => v.id === selectedVal)?.label || ''}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {vt.values.map(val => {
                const isSelected = selectedVal === val.id
                const isAvailable = variants.some(v =>
                  v.combination[vt.id] === val.id &&
                  Object.entries(selected).every(([k, vId]) =>
                    k === vt.id || v.combination[k] === vId
                  ) &&
                  v.stock_qty > 0
                )

                return (
                  <button
                    key={val.id}
                    onClick={() => onChange(vt.id, val.id)}
                    disabled={!isAvailable}
                    className={`relative px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary ring-1 ring-brand-primary/30'
                        : isAvailable
                          ? 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          : 'border-slate-100 text-slate-300 line-through cursor-not-allowed bg-slate-50'
                    }`}
                  >
                    {val.label}
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-brand-primary rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
