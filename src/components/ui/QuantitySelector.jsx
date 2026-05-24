export default function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  const dec = () => {
    if (value > min) onChange(value - 1)
  }
  const inc = () => {
    if (value < max) onChange(value + 1)
  }

  return (
    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={dec}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        −
      </button>
      <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-slate-900 border-x border-slate-200">
        {value}
      </span>
      <button
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  )
}
