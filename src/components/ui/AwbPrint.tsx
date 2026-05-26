import type { Order } from '../../types'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)
}

const COURIER_LOGOS: Record<string, string> = {
  jne_reg: 'JNE', jne_yes: 'JNE YES', jnt: 'J&T', sicepat: 'SiCepat', instant: 'Grab/GoSend', pickup: 'Pickup',
}

function generateAwbHtml(order: Order, pageBreak: boolean = false): string {
  const courierLabel = order.logistics?.courierLabel || order.shipping.label
  const trackingNumber = order.logistics?.trackingNumber || '-'
  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${trackingNumber}&code=Code128&translate-esc=true&dpi=203&imagetype=png&dpi=203`

  return `
<div class="awb-page${pageBreak ? ' page-break' : ''}">
  <div class="awb">
    <!-- Header -->
    <div class="awb-header">
      <div class="awb-sender">
        <div class="awb-store-name">DUNIA PANCING</div>
        <div class="awb-store-sub">Palembang — Indonesia</div>
        <div class="awb-store-addr">Jl. Kebon Jahe, Ilir Timur I</div>
        <div class="awb-store-addr">Palembang, Sumatera Selatan</div>
        <div class="awb-store-phone">📞 0812-xxxx-xxxx</div>
      </div>
      <div class="awb-courier-logo">
        <div class="awb-courier-name">${courierLabel}</div>
        <div class="awb-service">Reguler</div>
      </div>
    </div>

    <!-- Barcode -->
    <div class="awb-barcode-section">
      <img src="${barcodeUrl}" alt="Barcode" class="awb-barcode-img" />
      <div class="awb-tracking-number">${trackingNumber}</div>
    </div>

    <!-- Divider -->
    <div class="awb-divider">✂ --- LIPAT DISINI / FOLD HERE --- ✂</div>

    <!-- Recipient -->
    <div class="awb-recipient">
      <div class="awb-section-label">PENERIMA / RECIPIENT</div>
      <div class="awb-recipient-name">${order.customer.name}</div>
      <div class="awb-recipient-phone">📞 ${order.customer.phone}</div>
      <div class="awb-recipient-addr">${order.customer.address}</div>
      <div class="awb-recipient-addr">${order.customer.city}</div>
    </div>

    <!-- Divider -->
    <div class="awb-divider thin"></div>

    <!-- Packing Checklist -->
    <div class="awb-packing">
      <div class="awb-section-label">📋 PACKING LIST — Periksa Barang</div>
      <div class="awb-items">
        ${order.items.map(item => `
          <div class="awb-item">
            <span class="awb-item-checkbox">☐</span>
            <span class="awb-item-qty">${item.qty}x</span>
            <span class="awb-item-name">${item.name_id}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div class="awb-footer">
      <div class="awb-footer-row">
        <span class="awb-footer-label">Order</span>
        <span class="awb-footer-value">${order.id}</span>
      </div>
      <div class="awb-footer-row">
        <span class="awb-footer-label">Total</span>
        <span class="awb-footer-value">${formatPrice(order.total)}</span>
      </div>
      <div class="awb-footer-row">
        <span class="awb-footer-label">Pembayaran</span>
        <span class="awb-footer-value">${order.payment.label}</span>
      </div>
      <div class="awb-footer-row">
        <span class="awb-footer-label">Tanggal</span>
        <span class="awb-footer-value">${new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>

    <!-- Pickup info if applicable -->
    ${order.logistics?.pickupType === 'pickup' ? `
    <div class="awb-pickup-note">
      🚚 PICKUP — Kurir akan menjemput ke toko
    </div>
    ` : ''}
  </div>
</div>`
}

function getAwbStyles(): string {
  return `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Courier New', 'Courier', monospace; background: #fff; color: #000; font-size: 11px; line-height: 1.3; }

.awb-page {
  width: 4in;
  min-height: 6in;
  margin: 0 auto;
  padding: 0.15in;
}
.awb-page.page-break {
  page-break-after: always;
}

.awb {
  border: 2px solid #000;
  padding: 0.12in;
  background: #fff;
}

/* Header */
.awb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 2px solid #000;
}
.awb-store-name {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.awb-store-sub {
  font-size: 8px;
  color: #555;
  margin-top: 1px;
}
.awb-store-addr {
  font-size: 8px;
  color: #333;
  margin-top: 1px;
}
.awb-store-phone {
  font-size: 8px;
  color: #333;
  margin-top: 2px;
}
.awb-courier-name {
  font-size: 18px;
  font-weight: 900;
  text-align: right;
  letter-spacing: 1px;
}
.awb-service {
  font-size: 9px;
  text-align: right;
  color: #555;
}

/* Barcode */
.awb-barcode-section {
  text-align: center;
  padding: 8px 0;
  border-bottom: 1px dashed #999;
}
.awb-barcode-img {
  max-width: 85%;
  height: auto;
}
.awb-tracking-number {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 3px;
  margin-top: 3px;
  font-family: 'Courier New', monospace;
}

/* Divider */
.awb-divider {
  text-align: center;
  font-size: 8px;
  color: #999;
  padding: 4px 0;
  letter-spacing: 2px;
}
.awb-divider.thin {
  border-top: 1px dashed #ccc;
  margin: 4px 0;
  padding: 2px 0;
}

/* Recipient */
.awb-recipient {
  padding: 6px 0;
}
.awb-section-label {
  font-size: 8px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.awb-recipient-name {
  font-size: 14px;
  font-weight: 900;
}
.awb-recipient-phone {
  font-size: 11px;
  margin-top: 2px;
}
.awb-recipient-addr {
  font-size: 10px;
  color: #333;
  margin-top: 1px;
}

/* Packing */
.awb-packing {
  padding: 6px 0;
  border-top: 1px dashed #ccc;
}
.awb-items {
  margin-top: 4px;
}
.awb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  border-bottom: 1px dotted #ddd;
  font-size: 10px;
}
.awb-item-checkbox {
  font-size: 12px;
  color: #999;
}
.awb-item-qty {
  background: #000;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  padding: 0 4px;
  border-radius: 1px;
}
.awb-item-name {
  font-weight: 600;
  color: #222;
}

/* Footer */
.awb-footer {
  padding: 6px 0;
  border-top: 1px dashed #ccc;
}
.awb-footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  padding: 1px 0;
}
.awb-footer-label {
  color: #555;
}
.awb-footer-value {
  font-weight: 700;
}

.awb-pickup-note {
  margin-top: 6px;
  padding: 4px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
}

@media print {
  @page {
    size: 4in 6in;
    margin: 0;
  }
  body { margin: 0; }
}
`
}

export function printAwb(order: Order): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AWB ${order.id}</title>
  <style>${getAwbStyles()}</style>
</head>
<body>
  ${generateAwbHtml(order)}
  <script>
    window.onload = function() { window.print(); window.close(); }
  <\/script>
</body>
</html>`)

  printWindow.document.close()
}

export function bulkPrintAwb(orders: Order[]): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const pages = orders.map((o, i) => generateAwbHtml(o, i < orders.length - 1)).join('')

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bulk AWB — ${orders.length} labels</title>
  <style>${getAwbStyles()}</style>
</head>
<body>
  ${pages}
  <script>
    window.onload = function() { window.print(); window.close(); }
  <\/script>
</body>
</html>`)

  printWindow.document.close()
}
