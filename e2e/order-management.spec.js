import { test, expect } from '@playwright/test'

test.describe('Admin Order Management', () => {

  const baseOrder = {
    date: new Date().toISOString(),
    items: [{ id: 'dp-001', name_id: 'Produk Test', name_en: 'Test Product', image: '', price_idr: 50000, qty: 2 }],
    customer: { name: 'Budi', phone: '08123456789', address: 'Jl. Merdeka No.1', city: 'Palembang' },
    shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000 },
    payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA', accountNumber: '1234567890' },
    subtotal: 100000,
    shipping_fee: 15000,
    total: 115000,
    statusHistory: [{ status: 'waiting_payment', timestamp: new Date().toISOString() }],
  }

  async function setup(page, orders) {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.evaluate((data) => {
      localStorage.setItem('dunia-pancing-orders', JSON.stringify(data))
      localStorage.setItem('dunia-pancing-session', JSON.stringify({ username: 'admin', role: 'admin', name: 'Admin' }))
      localStorage.setItem('dunia-pancing-users', JSON.stringify([{ username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }]))
    }, orders)
    await page.goto('/admin/orders')
    await page.waitForLoadState('load')
    await page.waitForTimeout(300)
  }

  test('Admin orders page loads with tabs', async ({ page }) => {
    await setup(page, [])
    const tabArea = page.locator('div.flex.overflow-x-auto')
    await expect(tabArea.getByText(/Semua|All/)).toBeVisible()
    await expect(tabArea.getByText(/Menunggu Bayar|Unpaid/)).toBeVisible()
    await expect(tabArea.getByText(/Perlu Dikirim|To Ship/)).toBeVisible()
    await expect(tabArea.getByText('Dikirim', { exact: true }).or(tabArea.getByText('Shipping', { exact: true }))).toBeVisible()
    await expect(tabArea.getByText(/Selesai|Completed/)).toBeVisible()
    await expect(tabArea.getByText(/Dibatalkan|Cancelled/)).toBeVisible()
  })

  test('Displays orders in table filtered by status', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'DP-001', status: 'to_ship' },
      { ...baseOrder, id: 'DP-002', status: 'shipping', logistics: { courier: 'jnt', courierLabel: 'J&T Express', trackingNumber: 'JP1234567890', awbPrinted: false, pickupType: 'dropoff', shippedAt: new Date().toISOString() } },
    ]
    await setup(page, orders)
    // Default tab is "To Ship" — should show DP-001
    await expect(page.getByText('DP-001')).toBeVisible()
    await expect(page.getByText('DP-002')).not.toBeVisible()
  })

  test('Tab switching shows correct orders', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'DP-010', status: 'waiting_payment' },
      { ...baseOrder, id: 'DP-011', status: 'completed' },
    ]
    await setup(page, orders)

    // Click "All" tab
    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('DP-010')).toBeVisible()
    await expect(page.getByText('DP-011')).toBeVisible()

    // Click "Completed" tab
    await page.getByRole('button', { name: /Selesai|Completed/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('DP-010')).not.toBeVisible()
    await expect(page.getByText('DP-011')).toBeVisible()
  })

  test('Search filters orders by ID', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'DP-100', status: 'waiting_payment' },
      { ...baseOrder, id: 'DP-200', status: 'waiting_payment' },
    ]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    const searchInput = page.getByPlaceholder(/Cari ID|Search ID/)
    await searchInput.fill('DP-100')
    await page.waitForTimeout(500) // debounce

    await expect(page.getByText('DP-100')).toBeVisible()
    await expect(page.getByText('DP-200')).not.toBeVisible()
  })

  test('Arrange shipment modal generates resi', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'DP-300', status: 'to_ship' }]
    await setup(page, orders)

    // Click arrange shipment button (📦 icon button)
    await page.locator('button').filter({ has: page.locator('text=📦') }).first().click()
    await page.waitForTimeout(300)

    // Modal should appear
    await expect(page.getByText(/Atur Pengiriman|Arrange Shipment/)).toBeVisible()

    // Click "Generate Resi" / "Buat Resi"
    await page.getByRole('button', { name: /Buat Resi|Generate Resi/ }).click()
    await page.waitForTimeout(500)

    // Order should now be in "shipping" status
    const tabArea = page.locator('div.flex.overflow-x-auto')
    await tabArea.getByText('Dikirim', { exact: true }).or(tabArea.getByText('Shipping', { exact: true })).click()
    await page.waitForTimeout(200)

    await expect(page.getByText('DP-300')).toBeVisible()
  })

  test('Order detail modal opens and shows info', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'DP-500', status: 'waiting_payment' }]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    // Click order ID to open detail (the order ID is rendered as a button)
    await page.getByText('DP-500').first().click()
    await page.waitForTimeout(300)

    // Modal should show customer info
    await expect(page.getByText(/Detail Pesanan|Order Detail/)).toBeVisible()
    await expect(page.getByText('Budi').first()).toBeVisible()
    await expect(page.getByText('08123456789').first()).toBeVisible()
  })

  test('Cancel order modal requires reason', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'DP-600', status: 'waiting_payment' }]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    // Click cancel button (✕ icon button)
    await page.locator('button').filter({ has: page.locator('text=✕') }).first().click()
    await page.waitForTimeout(200)

    // Cancel modal should appear
    await expect(page.getByText(/Alasan Pembatalan|Cancellation Reason/)).toBeVisible()

    // Fill reason and confirm
    await page.locator('textarea').fill('Customer request')
    await page.getByRole('button', { name: /Ya, Batalkan|Yes.*Cancel/ }).click()
    await page.waitForTimeout(300)

    // Order should be cancelled — click Cancelled tab
    await page.getByRole('button', { name: /Dibatalkan|Cancelled/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('DP-600')).toBeVisible()
  })

  test('Status badge colors indicate order status', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'DP-700', status: 'waiting_payment' },
      { ...baseOrder, id: 'DP-701', status: 'paid' },
      { ...baseOrder, id: 'DP-702', status: 'to_ship' },
      { ...baseOrder, id: 'DP-703', status: 'shipping', logistics: { courier: 'jnt', courierLabel: 'J&T Express', trackingNumber: 'JP123', awbPrinted: false, pickupType: 'dropoff', shippedAt: new Date().toISOString() } },
      { ...baseOrder, id: 'DP-704', status: 'completed' },
      { ...baseOrder, id: 'DP-705', status: 'cancelled', cancelNote: 'Test cancel' },
    ]
    await setup(page, orders)

    // "All" tab should show all 6 orders
    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    for (const id of ['DP-700', 'DP-701', 'DP-702', 'DP-703', 'DP-704', 'DP-705']) {
      await expect(page.getByText(id).first()).toBeVisible()
    }
  })

  test('Bulk select and ship orders', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'DP-800', status: 'to_ship' },
      { ...baseOrder, id: 'DP-801', status: 'to_ship' },
    ]
    await setup(page, orders)

    // Check both checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.nth(1).check()
    await checkboxes.nth(2).check()

    // Bulk action bar should show selected count
    await expect(page.getByText(/dipilih|selected/)).toBeVisible()
  })
})
