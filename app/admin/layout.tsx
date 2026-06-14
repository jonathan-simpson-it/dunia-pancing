'use client'

import { useEffect } from 'react'
import { useLang } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import PageProviders from '@/components/layout/PageProviders'
import id from '@/locales/id.json'
import en from '@/locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

const sidebarLinks = [
  { to: '/admin', label_id: 'Produk', label_en: 'Products', icon: '📦' },
  { to: '/admin/orders', label_id: 'Pesanan', label_en: 'Orders', icon: '📋' },
  { to: '/admin/add', label_id: 'Tambah Produk', label_en: 'Add Product', icon: '➕' },
  { to: '/admin/vouchers', label_id: 'Voucher', label_en: 'Vouchers', icon: '🏷️' },
  { to: '/admin/chat', label_id: 'Chat', label_en: 'Chat', icon: '💬' },
  { to: '/admin/import', label_id: 'Import Harga', label_en: 'Price Import', icon: '📥' },
  { to: '/admin/revenue', label_id: 'Pendapatan', label_en: 'Revenue', icon: '💰' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const { user, logout, loaded, isLoggedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loaded && !isLoggedIn) {
      router.replace('/login')
    }
  }, [loaded, isLoggedIn, router])

  if (loaded && !isLoggedIn) return null

  return (
    <PageProviders>
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 pt-28">
          <div className="flex flex-col sm:flex-row gap-6">
            <aside className="w-full sm:w-56 shrink-0">
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50">
                  <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Panel</div>
                </div>
                <div className="p-2 space-y-0.5">
                  {sidebarLinks.map(link => (
                    <Link key={link.to} href={link.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${
                        pathname === link.to ? 'bg-brand-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}>
                      <span>{link.icon}</span><span>{lang === 'id' ? link.label_id : link.label_en}</span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-50 p-2">
                  <button onClick={() => { logout(); router.push('/login') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-all">
                    <span>🚪</span><span>{t('admin_logout', lang)}</span>
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PageProviders>
  )
}
