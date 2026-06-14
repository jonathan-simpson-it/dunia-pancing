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
  post: BlogPost
}

export default function BlogPostView({ post }: Props) {
  const { lang } = useLang()

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-slate-900 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-700">/</span>
            <Link href="/blog" className="hover:text-white transition-colors">{t('nav_blog', lang)}</Link>
            <span className="text-slate-700">/</span>
            <span className="text-sky-400">{lang === 'en' ? post.title_en : post.title_id}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-full">
              {lang === 'en' ? post.category_en : post.category_id}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
            {lang === 'en' ? post.title_en : post.title_id}
          </h1>
          <div className="flex items-center gap-4 mt-6 text-sm text-slate-400 font-medium">
            <span>{t('blog_by', lang)} {post.author}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{post.date}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-24">
        <article className="bg-white rounded-4xl p-10 sm:p-16 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="aspect-[16/9] bg-gradient-to-br from-sky-100 to-sky-50 rounded-3xl flex items-center justify-center mb-12">
            <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center text-sky-600">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            {(lang === 'en' ? post.content_en : post.content_id).split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-black text-slate-900 mt-12 mb-6 tracking-tight">
                    {line.replace('## ', '')}
                  </h2>
                )
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={i} className="text-slate-600 font-medium ml-6 mb-2 list-disc">
                    {line.replace('- ', '')}
                  </li>
                )
              }
              if (line.trim() === '') return <div key={i} className="h-4" />
              return (
                <p key={i} className="text-slate-600 leading-relaxed mb-4 text-base sm:text-lg">
                  {line}
                </p>
              )
            })}
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-sky-500 transition-all active:scale-95 shadow-xl shadow-sky-500/20"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            {t('blog_back', lang)}
          </Link>
        </div>
      </div>
    </div>
  )
}
