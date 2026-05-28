'use client'

import { useLang } from '../context/LanguageContext'
import Link from 'next/link'
import { useProducts } from '../context/ProductStore'
import Hero from '../components/ui/Hero'
import ProductCard from '../components/ui/ProductCard'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Home() {
  const { lang } = useLang()
  const { products, categories, getCategoryName } = useProducts()
  const featured = products.slice(0, 4)
  const topSellers = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 4)

  return (
    <div className="bg-slate-50">
      <Hero />
      
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-[0.3em]">
            Browse Collections
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
            {t('section_categories', lang)}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.key}
              to={`/catalog?category=${cat.key}`}
              className="group relative flex flex-col items-center gap-4 p-8 bg-white rounded-4xl border border-slate-100 hover:border-sky-200 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-sky-50 group-hover:scale-110 transition-all duration-500">
                {cat.icon || '📦'}
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors uppercase tracking-tight">
                  {getCategoryName(cat.key, lang)}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                  {products.filter(p => p.category === cat.key).length} {lang === 'id' ? 'Barang' : 'Items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-[0.3em]">
                Top Picks
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
                {t('section_featured', lang)}
              </h2>
              <p className="mt-4 text-slate-500 font-medium">
                Professional grade equipment tested for performance and durability in Palembang waters.
              </p>
            </div>
            <Link 
              to="/catalog" 
              className="group inline-flex items-center gap-2 text-sky-600 font-black uppercase tracking-widest text-sm hover:text-sky-500 transition-colors"
            >
              Explore Catalog
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-[0.3em]">
                Best Sellers
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
                {lang === 'id' ? 'Paling Laris' : 'Best Sellers'}
              </h2>
              <p className="mt-4 text-slate-500 font-medium">
                {lang === 'id'
                  ? 'Produk paling populer yang menjadi favorit pelanggan'
                  : 'The most popular products loved by our customers'}
              </p>
            </div>
            <Link
              to="/catalog?sort=bestseller"
              className="group inline-flex items-center gap-2 text-orange-600 font-black uppercase tracking-widest text-sm hover:text-orange-500 transition-colors"
            >
              {lang === 'id' ? 'Lihat Semua' : 'See All'}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {topSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {topSellers.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              {lang === 'id' ? 'Belum ada data penjualan' : 'No sales data yet'}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { 
                icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 
                title: lang === 'id' ? 'Barang Asli' : 'Original Gear',
                desc: lang === 'id' ? 'Semua produk bersertifikat asli dari brand resmi.' : 'All products are certified original from official brands.'
              },
              { 
                icon: 'M13 10V3L4 14h7v7l9-11h-7z', 
                title: lang === 'id' ? 'Pengiriman Cepat' : 'Fast Shipping',
                desc: lang === 'id' ? 'Proses pesanan di hari yang sama untuk area Palembang.' : 'Same-day processing for Palembang and surrounding areas.'
              },
              { 
                icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', 
                title: lang === 'id' ? 'Konsultasi Gratis' : 'Expert Advice',
                desc: lang === 'id' ? 'Hubungi kami untuk rekomendasi alat pancing yang tepat.' : 'Contact us for professional gear recommendations.'
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400 mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-sky-500/5 rounded-[40px] -z-10 animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-slate-900/5 rounded-[40px] -z-10" />
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/1143926/pexels-photo-1143926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Shop Interior"
                  className="w-full aspect-4/5 object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <div className="text-4xl font-black text-white leading-none">25+</div>
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-2">Years of Excellence</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <span className="text-xs font-black text-sky-600 uppercase tracking-[0.3em] mb-4 block">Dedicated Partner</span>
              <h2 className="text-4xl sm:text-6xl font-display font-black text-slate-900 leading-tight mb-8">
                {lang === 'id' ? 'Mitra Terpercaya Sejak 1998' : 'Your Professional Partner Since 1998'}
              </h2>
              <div className="space-y-6 text-slate-500 text-lg leading-relaxed mb-12">
                <p>
                  {lang === 'id' 
                    ? 'Berdiri di jantung kota Palembang, Dunia Pancing telah menjadi standar bagi komunitas pemancing. Kami memahami bahwa setiap tarikan memerlukan alat yang presisi.'
                    : 'Located in the heart of Palembang, Dunia Pancing has set the standard for the angling community. We understand that every catch requires precision equipment.'}
                </p>
                <p>
                  {lang === 'id'
                    ? 'Kami bangga menjadi dealer resmi brand internasional, menjamin keaslian dan layanan purna jual yang tidak bisa Anda temukan di tempat lain.'
                    : 'We are proud to be an authorized dealer for international brands, guaranteeing authenticity and after-sales service you won\'t find elsewhere.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/catalog" 
                  className="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 text-center"
                >
                  Shop Now
                </Link>
                <Link 
                  to="/contact" 
                  className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 text-center"
                >
                  {t('nav_contact', lang)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
