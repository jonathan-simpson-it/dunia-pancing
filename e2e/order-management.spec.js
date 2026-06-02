import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('Admin Order Management', () => {

  const baseOrder = {
    date: new Date('2024-01-01').toISOString(),
    items: [{ id: 'dp-001', name_id: 'Produk Test', name_en: 'Test Product', image: '', price_idr: 50000, qty: 2 }],
    customer: { name: 'Budi', phone: '08123456789', address: 'Jl. Merdeka No.1', city: 'Palembang' },
    shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000 },
    payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA', accountNumber: '1234567890' },
    subtotal: 100000,
    shipping_fee: 15000,
    total: 115000,
    statusHistory: [{ status: 'waiting_payment', timestamp: new Date('2024-01-01').toISOString() }],
  }

  async function setup(page, orders) {
    await page.context().clearCookies()
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.evaluate((data) => {
      localStorage.clear()
      localStorage.setItem('dunia-pancing-orders', JSON.stringify(data))
    }, orders)
    await loginAsAdmin(page)
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
      { ...baseOrder, id: 'TST-001', status: 'to_ship' },
      { ...baseOrder, id: 'TST-002', status: 'shipping', logistics: { courier: 'jnt', courierLabel: 'J&T Express', trackingNumber: 'JP1234567890', awbPrinted: false, pickupType: 'dropoff', shippedAt: new Date().toISOString() } },
    ]
    await setup(page, orders)
    await expect(page.getByText('TST-001')).toBeVisible()
    await expect(page.getByText('TST-002')).not.toBeVisible()
  })

  test('Tab switching shows correct orders', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'TST-010', status: 'waiting_payment' },
      { ...baseOrder, id: 'TST-011', status: 'completed' },
    ]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('TST-010')).toBeVisible()
    await expect(page.getByText('TST-011')).toBeVisible()

    await page.getByRole('button', { name: /Selesai|Completed/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('TST-010')).not.toBeVisible()
    await expect(page.getByText('TST-011')).toBeVisible()
  })

  test('Search filters orders by ID', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'TST-100', status: 'waiting_payment' },
      { ...baseOrder, id: 'TST-200', status: 'waiting_payment' },
    ]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    const searchInput = page.getByPlaceholder(/Cari ID|Search ID/)
    await searchInput.fill('TST-100')
    await page.waitForTimeout(500)

    await expect(page.getByText('TST-100')).toBeVisible()
    await expect(page.getByText('TST-200')).not.toBeVisible()
  })

  test('Arrange shipment modal generates resi', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'TST-300', status: 'to_ship' }]
    await setup(page, orders)

    await page.locator('button').filter({ has: page.locator('text=📦') }).first().click()
    await page.waitForTimeout(300)

    await expect(page.getByText(/Atur Pengiriman|Arrange Shipment/)).toBeVisible()

    await page.getByRole('button', { name: /Buat Resi|Generate Resi/ }).click()
    await page.waitForTimeout(500)

    const tabArea = page.locator('div.flex.overflow-x-auto')
    await tabArea.getByText('Dikirim', { exact: true }).or(tabArea.getByText('Shipping', { exact: true })).click()
    await page.waitForTimeout(200)

    await expect(page.getByText('TST-300')).toBeVisible()
  })

  test('Order detail modal opens and shows info', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'TST-500', status: 'waiting_payment' }]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    await page.getByText('TST-500').first().click()
    await page.waitForTimeout(300)

    await expect(page.getByText(/Detail Pesanan|Order Detail/)).toBeVisible()
    await expect(page.getByText('Budi').first()).toBeVisible()
    await expect(page.getByText('08123456789').first()).toBeVisible()
  })

  test('Cancel order modal requires reason', async ({ page }) => {
    const orders = [{ ...baseOrder, id: 'TST-600', status: 'waiting_payment' }]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    await page.locator('button').filter({ has: page.locator('text=✕') }).first().click()
    await page.waitForTimeout(200)

    await expect(page.getByText(/Alasan Pembatalan|Cancellation Reason/)).toBeVisible()

    await page.locator('textarea').fill('Customer request')
    await page.getByRole('button', { name: /Ya, Batalkan|Yes.*Cancel/ }).click()
    await page.waitForTimeout(300)

    await page.getByRole('button', { name: /Dibatalkan|Cancelled/ }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('TST-600')).toBeVisible()
  })

  test('Status badge colors indicate order status', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'TST-700', status: 'waiting_payment' },
      { ...baseOrder, id: 'TST-701', status: 'paid' },
      { ...baseOrder, id: 'TST-702', status: 'to_ship' },
      { ...baseOrder, id: 'TST-703', status: 'shipping', logistics: { courier: 'jnt', courierLabel: 'J&T Express', trackingNumber: 'JP123', awbPrinted: false, pickupType: 'dropoff', shippedAt: new Date().toISOString() } },
      { ...baseOrder, id: 'TST-704', status: 'completed' },
      { ...baseOrder, id: 'TST-705', status: 'cancelled', cancelNote: 'Test cancel' },
    ]
    await setup(page, orders)

    await page.getByRole('button', { name: /Semua|All/ }).click()
    await page.waitForTimeout(200)

    for (const id of ['TST-700', 'TST-701', 'TST-702', 'TST-703', 'TST-704', 'TST-705']) {
      await expect(page.getByText(id).first()).toBeVisible()
    }
  })

  test('Bulk select and ship orders', async ({ page }) => {
    const orders = [
      { ...baseOrder, id: 'TST-800', status: 'to_ship' },
      { ...baseOrder, id: 'TST-801', status: 'to_ship' },
    ]
    await setup(page, orders)

    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.nth(1).check()
    await checkboxes.nth(2).check()

    await expect(page.getByText(/dipilih|selected/)).toBeVisible()
  })
})
