'use client'

import { useLang } from '../context/LanguageContext'
import Link from 'next/link'
import { BlogPost } from '../types'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface Props {
  posts: BlogPost[]
}

export default function Blog({ posts }: Props) {
  const { lang } = useLang()

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-700">/</span>
            <span className="text-sky-400">{t('nav_blog', lang)}</span>
          </nav>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            {t('blog_title', lang)}
          </h1>
          <p className="text-slate-400 text-lg mt-4 max-w-2xl font-medium">
            {t('blog_desc', lang)}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center overflow-hidden">
                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full">
                    {lang === 'en' ? post.category_en : post.category_id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{post.date}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-sky-600 transition-colors tracking-tight mb-3">
                  {lang === 'en' ? post.title_en : post.title_id}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {lang === 'en' ? post.excerpt_en : post.excerpt_id}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-sky-600 group-hover:gap-3 transition-all">
                  <span>{t('blog_read_more', lang)}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
