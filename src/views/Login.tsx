'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Login() {
  const { lang } = useLang()
  const { login, register, isLoggedIn, user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<'admin' | 'client'>('admin')
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', confirmPassword: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(user?.role === 'admin' ? '/admin' : '/')
    }
  }, [isLoggedIn, user, router])

  if (isLoggedIn) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (role === 'admin') {
      if (login(form.username, form.password)) {
        router.replace('/admin')
      } else {
        setError(lang === 'id' ? 'Username atau password salah' : 'Invalid username or password')
      }
    } else {
      if (tab === 'login') {
        if (login(form.username, form.password)) {
          router.replace('/')
        } else {
          setError(lang === 'id' ? 'Akun tidak ditemukan. Cek No. HP dan password' : 'Account not found. Check phone and password')
        }
      } else {
        if (form.password !== form.confirmPassword) {
          setError(lang === 'id' ? 'Password tidak cocok' : 'Passwords do not match')
          return
        }
        if (register({ name: form.name, phone: form.phone, password: form.password })) {
          router.replace('/')
        } else {
          setError(lang === 'id' ? 'No. HP sudah terdaftar' : 'Phone number already registered')
        }
      }
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-24 pb-16">

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Dunia Pancing</h1>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setRole('admin'); setError(''); setForm({ username: '', password: '', name: '', phone: '', confirmPassword: '' }) }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin
            </button>
            <button
              onClick={() => { setRole('client'); setError(''); setForm({ username: '', password: '', name: '', phone: '', confirmPassword: '' }) }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('login_client', lang)}
            </button>
          </div>

          {role === 'client' && (
            <div className="flex gap-4 mb-6 border-b border-slate-100">
              <button
                onClick={() => { setTab('login'); setError('') }}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${tab === 'login' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}
              >
                {t('login_signin', lang)}
              </button>
              <button
                onClick={() => { setTab('register'); setError('') }}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${tab === 'register' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-400'}`}
              >
                {t('login_signup', lang)}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'admin' && (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_username', lang)}
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={update('username')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="admin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_password', lang)}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </>
            )}

            {role === 'client' && tab === 'login' && (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_phone', lang)}
                  </label>
                  <input
                    type="tel"
                    value={form.username}
                    onChange={update('username')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="08123456789"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_password', lang)}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </>
            )}

            {role === 'client' && tab === 'register' && (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_name', lang)}
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="Budi Santoso"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_phone', lang)}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="08123456789"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_password', lang)}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="Min. 6 karakter"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                    {t('login_confirm_password', lang)}
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
                    placeholder="Ulangi password"
                    required
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20"
            >
              {tab === 'register' ? t('login_signup', lang) : t('login_signin', lang)}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
