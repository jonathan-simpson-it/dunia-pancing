'use client'

import { useLang } from '../context/LanguageContext'
import Link from 'next/link'
import Hero from '../components/ui/Hero'
import id from '../locales/id.json'
import en from '../locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

export default function Home() {
  const { lang } = useLang()

  return (
    <div className="bg-slate-50">
      <Hero />

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { number: '15+', label: lang === 'id' ? 'Tahun Pengalaman' : 'Years Experience', desc: lang === 'id' ? 'Melayani pemancing Palembang sejak 2011' : 'Serving Palembang anglers since 2011' },
              { number: '1000+', label: lang === 'id' ? 'Pelanggan Puas' : 'Happy Customers', desc: lang === 'id' ? 'Toko alat pancing terpercaya' : 'Trusted fishing gear store' },
              { number: '50+', label: lang === 'id' ? 'Brand Tersedia' : 'Brands Available', desc: lang === 'id' ? 'Dealer resmi brand internasional' : 'Official international brand dealer' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-10 bg-slate-50 rounded-4xl border border-slate-100">
                <div className="text-5xl sm:text-7xl font-display font-black text-sky-600 leading-none mb-3">
                  {stat.number}
                </div>
                <div className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">
                  {stat.label}
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-[0.3em]">
            Coming Soon
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight">
            Marketplace Sedang Dibangun
          </h2>
          <p className="mt-6 text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
            Kami sedang menyiapkan platform belanja online terlengkap untuk alat pancing.
            Sementara itu, hubungi kami langsung untuk pemesanan.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
            >
              Hubungi Kami
            </Link>
          </div>
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
                  <div className="text-4xl font-black text-white leading-none">15+</div>
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-2">Years of Excellence</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <span className="text-xs font-black text-sky-600 uppercase tracking-[0.3em] mb-4 block">Dedicated Partner</span>
              <h2 className="text-4xl sm:text-6xl font-display font-black text-slate-900 leading-tight mb-8">
                {lang === 'id' ? 'Mitra Terpercaya Sejak 2011' : 'Your Trusted Partner Since 2011'}
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
                  href="/contact" 
                  className="px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 text-center"
                >
                  {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
