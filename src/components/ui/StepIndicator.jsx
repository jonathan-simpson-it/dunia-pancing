export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            i <= current
              ? 'bg-brand-primary text-white'
              : 'bg-slate-100 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i <= current ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              {i + 1}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-px ${i < current ? 'bg-brand-primary' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
