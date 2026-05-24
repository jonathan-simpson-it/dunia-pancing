import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { loadOrders } from '../utils/order'
import MetaTags from '../components/seo/MetaTags'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Account() {
  const { lang } = useLang()
  const { user, logout } = useAuth()

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  const myOrders = user
    ? loadOrders().filter(o => o.customer?.phone === user.username)
    : []

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaTags title={`${t('account_title', lang)} — Dunia Pancing`} />

      <div className="bg-white border-b border-slate-100 pt-28 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold text-slate-900">{t('account_title', lang)}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-2xl font-black text-brand-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
                <p className="text-[12px] text-slate-500">{user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              {lang === 'id' ? 'Keluar' : 'Logout'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            {lang === 'id' ? 'Riwayat Pesanan' : 'Order History'}
          </h3>

          {myOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">
                {lang === 'id' ? 'Belum ada pesanan' : 'No orders yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div key={order.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-slate-900 text-[12px]">{order.id}</span>
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                      {lang === 'id' ? 'Menunggu Pembayaran' : 'Waiting Payment'}
                    </span>
                  </div>
                  <div className="space-y-2 text-[12px] text-slate-600">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{lang === 'id' ? item.name_id : item.name_en} × {item.qty}</span>
                        <span className="font-semibold">{formatPrice(item.price_idr * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between text-[13px]">
                    <span className="font-bold text-slate-900">{lang === 'id' ? 'Total' : 'Total'}</span>
                    <span className="font-bold text-brand-primary">{formatPrice(order.total)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    {new Date(order.date).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
