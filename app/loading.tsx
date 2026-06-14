export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-screen max-h-150 bg-slate-200 animate-pulse" />
      <div className="py-32 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-4xl animate-pulse" />
          ))}
        </div>
      </div>
      <div className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="h-6 bg-slate-200 rounded-full w-40 mx-auto animate-pulse" />
          <div className="h-12 bg-slate-200 rounded w-96 mx-auto mt-4 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-slate-200 rounded-4xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
