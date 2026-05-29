import type { ProductFeature } from '../../types'

interface FeatureBadgesProps {
  features: ProductFeature[]
}

export default function FeatureBadges({ features }: FeatureBadgesProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {features.map(f => (
        <span
          key={f.id}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full"
        >
          {f.icon && <span className="text-xs">{f.icon}</span>}
          {f.label}
        </span>
      ))}
    </div>
  )
}
