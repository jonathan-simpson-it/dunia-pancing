export default function StarRating({ rating, size = 10 }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.3
  const stars = []

  for (let i = 0; i < 5; i++) {
    let cls
    if (i < full) {
      cls = 'text-yellow-400'
    } else if (i === full && hasHalf) {
      cls = 'text-yellow-400'
    } else {
      cls = 'text-slate-200'
    }
    stars.push(
      <span key={i} className={cls} style={{ fontSize: size }}>
        ★
      </span>
    )
  }

  return <span className="inline-flex items-center gap-px">{stars}</span>
}
