import type { Order, OrderItem, Customer, ShippingInfo, PaymentInfo, ShippingOption, PaymentOption, OrderStatus, LogisticsInfo, StatusHistoryEntry } from '../types'

function parseCustomerNote(note: string | null | undefined): { text: string; kecamatan: string; kecamatanId: number | null; serviceType: string } {
  try {
    if (note && note.startsWith('{')) return JSON.parse(note)
  } catch {}
  return { text: note || '', kecamatan: '', kecamatanId: null, serviceType: '' }
}

function mapDbOrderToLocal(dbo: any): Order {
  const parsedNote = parseCustomerNote(dbo.customerNote)
  return {
    id: dbo.orderNumber || dbo.id,
    date: dbo.createdAt,
    status: dbo.status,
    items: (dbo.items || []).map((i: any) => ({
      id: i.productId || i.product?.id || i.id,
      name_id: i.nameId || i.name_id || '',
      name_en: i.nameEn || i.name_en || '',
      image: i.image || '',
      price_idr: i.priceIdr ?? i.price_idr ?? 0,
      qty: i.qty ?? 1,
    })),
    customer: {
      name: dbo.customerName,
      phone: dbo.customerPhone,
      address: dbo.customerAddress || '',
      city: dbo.customerCity || '',
      notes: parsedNote.text,
      kecamatan: parsedNote.kecamatan,
      kecamatanId: parsedNote.kecamatanId,
    },
    shipping: {
      id: dbo.courier || '',
      label: dbo.shippingLabel || '',
      fee: dbo.shippingFee ?? 0,
      serviceType: parsedNote.serviceType,
    },
    payment: {
      id: '',
      label: dbo.paymentMethod || '',
      method: dbo.paymentType || '',
      bank: dbo.paymentBank || '',
      accountNumber: '',
    },
    subtotal: dbo.subtotal ?? 0,
    shipping_fee: dbo.shippingFee ?? 0,
    discount: dbo.discount ?? 0,
    total: dbo.total ?? 0,
    logistics: dbo.courier ? {
      courier: dbo.courier,
      courierLabel: dbo.courierLabel || dbo.courier,
      trackingNumber: dbo.awbNumber || '',
      awbPrinted: dbo.awbPrinted || false,
      pickupType: dbo.pickupType || 'dropoff',
      pickupWindow: dbo.pickupWindow,
      shippedAt: dbo.shippedAt,
      deliveredAt: dbo.deliveredAt,
    } : undefined,
    cancelNote: dbo.cancelNote,
    statusHistory: (dbo.statusHistory || []).map((h: any) => ({
      status: h.status,
      timestamp: h.timestamp || h.createdAt,
      note: h.note,
    })),
  }
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders?pageSize=1000')
    if (res.ok) {
      const data = await res.json()
      return (data.orders || []).map(mapDbOrderToLocal)
    }
  } catch {}
  return []
}

export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders?pageSize=1&search=${encodeURIComponent(orderId)}`)
    if (res.ok) {
      const data = await res.json()
      const found = (data.orders || []).find((o: any) =>
        (o.orderNumber || o.id) === orderId ||
        o.customerName?.toLowerCase().includes(orderId.toLowerCase())
      )
      if (found) return mapDbOrderToLocal(found)
    }
  } catch {}
  return null
}

export async function loadPaginatedOrders(
  page: number,
  pageSize: number,
  statusFilter?: OrderStatus | null,
  search?: string,
  sortField?: 'date' | 'total',
  sortDir?: 'asc' | 'desc',
): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (statusFilter) params.set('status', statusFilter)
    if (search) params.set('search', search)
    if (sortField) params.set('sortField', sortField)
    if (sortDir) params.set('sortDir', sortDir)

    const res = await fetch(`/api/orders?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      return {
        orders: (data.orders || []).map(mapDbOrderToLocal),
        total: data.total || 0,
        page: data.page || page,
        totalPages: data.totalPages || 1,
      }
    }
  } catch {}

  return { orders: [], total: 0, page, totalPages: 0 }
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/orders?pageSize=1000')
    if (res.ok) {
      const data = await res.json()
      const orders = data.orders || []
      const counts: Record<string, number> = { all: orders.length }
      orders.forEach((o: any) => {
        const s = o.status || 'unknown'
        counts[s] = (counts[s] || 0) + 1
      })
      return counts
    }
  } catch {}
  return { all: 0 }
}

export async function getOrderSingle(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}`)
    if (res.ok) {
      const data = await res.json()
      return mapDbOrderToLocal(data)
    }
  } catch {}
  return null
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note }),
    })
    if (res.ok) {
      const data = await res.json()
      return mapDbOrderToLocal(data)
    }
  } catch {}
  return null
}

export async function assignResi(
  orderId: string,
  courier: string,
  courierLabel: string,
  trackingNumber: string,
  pickupType: 'dropoff' | 'pickup',
  pickupWindow?: string,
): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'shipping',
        courier,
        courierLabel,
        awbNumber: trackingNumber,
        note: `Resi: ${trackingNumber} (${courierLabel})`,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return mapDbOrderToLocal(data)
    }
  } catch {}
  return null
}

export async function markAwbPrinted(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, 'shipping', 'AWB printed')
}

export async function bulkUpdateOrderStatus(ids: string[], newStatus: OrderStatus, note?: string): Promise<Order[]> {
  const results = await Promise.allSettled(
    ids.map(id =>
      fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      }).then(r => r.ok ? r.json() : null)
    )
  )
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
    .map(r => mapDbOrderToLocal(r.value))
}

export async function bulkAssignResi(
  items: { orderId: string; courier: string; courierLabel: string; trackingNumber: string; pickupType: 'dropoff' | 'pickup' }[],
): Promise<{ success: Order[]; failed: string[] }> {
  const success: Order[] = []
  const failed: string[] = []

  const results = await Promise.allSettled(
    items.map(item =>
      fetch(`/api/orders/${item.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'shipping',
          courier: item.courier,
          courierLabel: item.courierLabel,
          awbNumber: item.trackingNumber,
          note: `Resi: ${item.trackingNumber} (${item.courierLabel})`,
        }),
      }).then(r => r.ok ? { orderId: item.orderId, data: r.json() } : null)
    )
  )

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      success.push(mapDbOrderToLocal(r.value))
    } else {
      failed.push(items[i].orderId)
    }
  })

  return { success, failed }
}

export async function cancelOrder(orderId: string, reason: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled', cancelNote: reason, note: reason }),
    })
    if (res.ok) {
      const data = await res.json()
      return mapDbOrderToLocal(data)
    }
  } catch {}
  return null
}

export async function clearOrders(): Promise<void> {}

export function buildWhatsAppMessage(order: Order, lang: 'id' | 'en'): string {
  const lines = order.items.map(item => {
    const name = lang === 'id' ? item.name_id : item.name_en
    return `• ${name} × ${item.qty} — Rp${(item.price_idr * item.qty).toLocaleString('id-ID')}`
  })

  const bankInfo = order.payment.method === 'bank_transfer'
    ? `\n\n💳 Transfer ke:\n${order.payment.bank}\na.n. Dunia Pancing Palembang\nNo. Rek: ${order.payment.accountNumber}`
    : ''

  const msg = [
    `🛒 *PESANAN BARU — Dunia Pancing Palembang*`,
    ``,
    `No. Pesanan: *${order.id}*`,
    `Status: *${lang === 'id' ? 'Menunggu Pembayaran' : 'Waiting for Payment'}*`,
    ``,
    `📦 *${lang === 'id' ? 'Pesanan' : 'Items'}*`,
    ...lines,
    ``,
    `🚚 ${lang === 'id' ? 'Pengiriman' : 'Shipping'}: ${order.shipping.label}`,
    `📍 ${order.customer.address}, ${order.customer.city}`,
    ``,
    `💵 *${lang === 'id' ? 'Total' : 'Total'}: Rp${order.total.toLocaleString('id-ID')}*`,
    bankInfo,
    ``,
    `👤 ${order.customer.name}`,
    `📞 ${order.customer.phone}`,
    order.customer.notes ? `📝 ${order.customer.notes}` : '',
    ``,
    `_${lang === 'id' ? 'Mohon konfirmasi pembayaran dengan mengirim bukti transfer via WhatsApp ini' : 'Please confirm payment by sending the transfer receipt via this WhatsApp'}_`,
  ].filter(Boolean).join('\n')

  return msg
}

export function printInvoice(order: Order): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${item.name_id}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatPrice(item.price_idr)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${formatPrice(item.price_idr * item.qty)}</td>
    </tr>
  `).join('')

  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${order.id}&code=Code128&translate-esc=true&dpi=300&imagetype=png`

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.id}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; color: #000; font-size: 12px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000; }
    .store-name { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
    .store-tagline { font-size: 10px; color: #555; margin-top: 2px; }
    .invoice-title { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 12px; background: #f5f5f5; }
    .meta-col p { font-size: 11px; margin: 2px 0; }
    .meta-col strong { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #000; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    tfoot td { padding: 8px 12px; font-weight: 700; font-size: 13px; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .totals-row.total { border-top: 2px solid #000; margin-top: 4px; padding-top: 8px; font-size: 16px; font-weight: 900; }
    .barcode-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ccc; }
    .barcode-section img { max-width: 300px; }
    .barcode-number { font-size: 14px; font-weight: 700; letter-spacing: 3px; margin-top: 4px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
    .note { margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; font-size: 11px; }
    .packing-header { background: #000; color: #fff; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .checklist-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px dotted #ccc; font-size: 12px; }
    .checklist-item .qty-badge { background: #000; color: #fff; padding: 1px 6px; font-size: 10px; font-weight: 700; border-radius: 2px; margin-right: 6px; }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>

<div class="header">
  <div>
    <div class="store-name">Dunia Pancing</div>
    <div class="store-tagline">Palembang • Indonesia</div>
  </div>
  <div style="text-align:right">
    <div class="invoice-title">INVOICE</div>
    <div style="font-size:11px;margin-top:4px">#${order.id}</div>
  </div>
</div>

<div class="meta">
  <div class="meta-col">
    <p><strong>Tanggal</strong> ${new Date(order.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <p><strong>Status</strong> ${order.status === 'waiting_payment' ? 'Menunggu Pembayaran' : order.status}</p>
  </div>
  <div class="meta-col">
    <p><strong>Pelanggan</strong> ${order.customer.name}</p>
    <p><strong>No. HP</strong> ${order.customer.phone}</p>
    <p><strong>Alamat</strong> ${order.customer.address}, ${order.customer.city}</p>
  </div>
  <div class="meta-col" style="text-align:right">
    <p><strong>Pengiriman</strong> ${order.shipping.label}</p>
    <p><strong>Pembayaran</strong> ${order.payment.label}</p>
  </div>
</div>

<div class="packing-header">📦 PACKING LIST — Periksa & Siapkan Barang</div>

<table>
  <thead>
    <tr>
      <th style="width:50%">Nama Produk</th>
      <th style="width:10%;text-align:center">Jumlah</th>
      <th style="width:20%;text-align:right">Harga</th>
      <th style="width:20%;text-align:right">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHtml}
  </tbody>
</table>

<div style="margin-top:15px;">
  <div style="font-weight:700;font-size:13px;margin-bottom:6px">✅ Checklist Packing:</div>
  ${order.items.map(item => `
    <div class="checklist-item">
      <span>☐</span>
      <span class="qty-badge">${item.qty}x</span>
      <span>${item.name_id}</span>
    </div>
  `).join('')}
</div>

<div class="totals" style="margin-left:auto;margin-top:15px">
  <div class="totals-row">
    <span>Subtotal</span>
    <span>${formatPrice(order.subtotal)}</span>
  </div>
  <div class="totals-row">
    <span>Ongkos Kirim</span>
    <span>${formatPrice(order.shipping_fee)}</span>
  </div>
  <div class="totals-row total">
    <span>TOTAL</span>
    <span>${formatPrice(order.total)}</span>
  </div>
</div>

<div class="barcode-section">
  <img src="${barcodeUrl}" alt="Barcode" />
  <div class="barcode-number">${order.id}</div>
  <div style="font-size:10px;color:#888;margin-top:2px">Gunakan barcode ini untuk pelacakan pengiriman</div>
</div>

${order.customer.notes ? `<div class="note"><strong>Catatan Pelanggan:</strong> ${order.customer.notes}</div>` : ''}

<div class="footer">
  Dunia Pancing Palembang • Jl. Kebon Jahe, Ilir Timur I, Palembang, Sumatera Selatan<br>
  Terima kasih telah berbelanja di Dunia Pancing! 🎣
</div>

</body>
</html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

// ─── Courier prefixes for mock resi generation ──────────
const COURIER_PREFIXES: Record<string, string> = {
  jne_reg: 'JNE',
  jne_yes: 'JNY',
  jnt: 'JP',
  sicepat: 'SPX',
  instant: 'GO',
  pickup: 'PKP',
}

export function generateResiNumber(courierId: string): string {
  const prefix = COURIER_PREFIXES[courierId] || 'RSI'
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(2)
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  return `${prefix}${dd}${mm}${yy}-${rand}`
}

export function getResiPlaceholder(trackingNumber: string): string {
  return trackingNumber || '-'
}

export const SHIPPING_METHODS: ShippingOption[] = [
  { id: 'jne_reg',   label_id: 'JNE Regular',   label_en: 'JNE Regular',   fee: 15000,  etd_id: '2-3 hari',  etd_en: '2-3 days' },
  { id: 'jne_yes',   label_id: 'JNE YES',       label_en: 'JNE YES',       fee: 30000,  etd_id: '1-2 hari',  etd_en: '1-2 days' },
  { id: 'jnt',       label_id: 'J&T Express',   label_en: 'J&T Express',   fee: 18000,  etd_id: '2-3 hari',  etd_en: '2-3 days' },
  { id: 'sicepat',   label_id: 'SiCepat REG',   label_en: 'SiCepat REG',   fee: 14000,  etd_id: '2-5 hari',  etd_en: '2-5 days' },
  { id: 'instant',   label_id: 'Grab/Gosend',   label_en: 'Grab/GoSend',   fee: 25000,  etd_id: '±1 jam',    etd_en: '±1 hour' },
  { id: 'pickup',    label_id: 'Ambil di Toko', label_en: 'Store Pickup',  fee: 0,      etd_id: '-',          etd_en: '-' },
]

export const PAYMENT_METHODS: PaymentOption[] = [
  { id: 'bca',       label_id: 'Transfer BCA',          label_en: 'BCA Transfer',       type: 'bank_transfer', bank: 'BCA',     accountNumber: '1234567890' },
  { id: 'bri',       label_id: 'Transfer BRI',          label_en: 'BRI Transfer',       type: 'bank_transfer', bank: 'BRI',     accountNumber: '0987654321' },
  { id: 'mandiri',   label_id: 'Transfer Mandiri',     label_en: 'Mandiri Transfer',   type: 'bank_transfer', bank: 'Mandiri', accountNumber: '1122334455' },
  { id: 'cod',       label_id: 'COD (Bayar di Tempat)', label_en: 'COD (Cash on Delivery)', type: 'cod', bank: '-', accountNumber: '-' },
  { id: 'gopay',     label_id: 'GoPay',                 label_en: 'GoPay',              type: 'ewallet', bank: '-', accountNumber: '-' },
  { id: 'ovo',       label_id: 'OVO',                   label_en: 'OVO',                type: 'ewallet', bank: '-', accountNumber: '-' },
  { id: 'pay_store', label_id: 'Bayar di Toko',         label_en: 'Pay at Store',       type: 'pay_store', bank: '-', accountNumber: '-' },
]
