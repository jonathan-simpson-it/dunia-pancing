import { useLang } from '../../context/LanguageContext'
import { printInvoice } from '../../utils/order'
import Barcode from './Barcode'
import type { Order } from '../../types'

interface InvoicePrintProps {
  order: Order
}

export default function InvoicePrint({ order }: InvoicePrintProps) {
  const { lang } = useLang()

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div>
      <div id="invoice-content" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-start pb-5 border-b-2 border-slate-900 mb-5">
          <div>
            <div className="text-xl font-black tracking-widest text-slate-900">DUNIA PANCING</div>
            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Palembang • Indonesia</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black tracking-[0.15em] text-slate-900">INVOICE</div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono font-bold">#{order.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg text-[11px]">
          <div>
            <p className="text-slate-500 mb-0.5">{lang === 'id' ? 'Tanggal' : 'Date'}</p>
            <p className="font-semibold text-slate-900">
              {new Date(order.date).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p className="text-slate-500 mt-1.5 mb-0.5">{lang === 'id' ? 'Status' : 'Status'}</p>
            <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded">
              {lang === 'id' ? 'Menunggu Pembayaran' : 'Waiting for Payment'}
            </span>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">{lang === 'id' ? 'Pelanggan' : 'Customer'}</p>
            <p className="font-semibold text-slate-900">{order.customer.name}</p>
            <p className="text-slate-600">{order.customer.phone}</p>
            <p className="text-slate-600 mt-0.5">{order.customer.address}, {order.customer.city}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-slate-500 mb-0.5">{lang === 'id' ? 'Pengiriman' : 'Shipping'}</p>
            <p className="font-semibold text-slate-900">{order.shipping.label}</p>
            <p className="text-slate-500 mt-1.5 mb-0.5">{lang === 'id' ? 'Pembayaran' : 'Payment'}</p>
            <p className="font-semibold text-slate-900">{order.payment.label}</p>
          </div>
        </div>

        <div className="mb-5">
          <div className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-t-lg">
            {lang === 'id' ? '📦 PACKING LIST — Periksa & Siapkan Barang' : '📦 PACKING LIST — Check & Prepare Items'}
          </div>
          <div className="border-x border-b border-slate-200 rounded-b-lg divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 text-[12px]">
                <span className="text-slate-300 font-mono">☐</span>
                <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">{item.qty}x</span>
                <span className="text-slate-900 font-medium">{item.name_id}</span>
              </div>
            ))}
          </div>
        </div>

        <table className="w-full text-[12px] mb-4">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left px-3 py-2 font-bold text-[10px] uppercase tracking-wider">{lang === 'id' ? 'Produk' : 'Product'}</th>
              <th className="text-center px-3 py-2 font-bold text-[10px] uppercase tracking-wider">{lang === 'id' ? 'Jml' : 'Qty'}</th>
              <th className="text-right px-3 py-2 font-bold text-[10px] uppercase tracking-wider">{lang === 'id' ? 'Harga' : 'Price'}</th>
              <th className="text-right px-3 py-2 font-bold text-[10px] uppercase tracking-wider">{lang === 'id' ? 'Subtotal' : 'Subtotal'}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                <td className="px-3 py-2.5 text-slate-900 font-medium">{item.name_id}</td>
                <td className="px-3 py-2.5 text-center text-slate-700">{item.qty}</td>
                <td className="px-3 py-2.5 text-right text-slate-700">{formatPrice(item.price_idr)}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatPrice(item.price_idr * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-full sm:w-72 space-y-1 text-[12px] mb-6">
          <div className="flex justify-between text-slate-600">
            <span>{lang === 'id' ? 'Subtotal' : 'Subtotal'}</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{lang === 'id' ? 'Ongkos Kirim' : 'Shipping'}</span>
            <span>{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2 mt-2">
            <span>{lang === 'id' ? 'TOTAL' : 'TOTAL'}</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="text-center pt-5 border-t-2 border-dashed border-slate-200">
          <Barcode value={order.id} height={50} width={1.8} fontSize={14} />
          <div className="text-[10px] text-slate-400 mt-1">
            {lang === 'id' ? 'Gunakan barcode ini untuk pelacakan pengiriman' : 'Use this barcode for delivery tracking'}
          </div>
        </div>

        {order.customer.notes && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-[11px] text-yellow-800">
            <strong>{lang === 'id' ? 'Catatan:' : 'Notes:'}</strong> {order.customer.notes}
          </div>
        )}

        <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          Dunia Pancing Palembang • Jl. Kebon Jahe, Ilir Timur I, Palembang<br />
          {lang === 'id' ? 'Terima kasih telah berbelanja di Dunia Pancing!' : 'Thank you for shopping at Dunia Pancing!'}
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => printInvoice(order)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {lang === 'id' ? 'Cetak Invoice' : 'Print Invoice'}
        </button>
      </div>
    </div>
  )
}
