import { test, expect } from '@playwright/test'

test.describe('Full Customer Purchase Flow (Catalog → Arrived)', () => {

  async function loginAsAdmin(page) {
    await page.goto('/login')
    await page.getByRole('button', { name: /admin/i }).click()
    await page.waitForTimeout(200)
    await page.getByPlaceholder('admin').fill('admin')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/\/admin/, { timeout: 10000 })
  }

  async function getOrderStatus(page, orderNumber) {
    const resp = await page.request.get(`/api/orders?search=${orderNumber}&pageSize=1`)
    const data = await resp.json()
    const order = data.orders?.find(o => o.orderNumber === orderNumber)
    return order ? order.status : null
  }

  async function clickModalButtonByText(page, text) {
    const btn = page.locator('div[class*="fixed"][class*="z-50"]:not([class*="hidden"]) button').filter({ hasText: text })
    await expect(btn).toBeVisible({ timeout: 5000 })
    await btn.click()
    await page.waitForTimeout(800)
  }

  test('Complete flow: guest buys → admin confirms → ships → delivers', async ({ browser }) => {
    const customer = await browser.newPage()
    const admin = await browser.newPage()

    // ═══════════════════════════════════════════════
    // PHASE 1: Customer buys a product as guest
    // ═══════════════════════════════════════════════
    await customer.goto('/product/dp-003')
    await customer.waitForLoadState('load')
    await customer.waitForTimeout(1000)

    await customer.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(customer).toHaveURL('/cart')
    await customer.waitForTimeout(500)

    await customer.goto('/checkout')
    await customer.waitForTimeout(800)

    // Fill customer info
    await customer.locator('input[placeholder="Budi Santoso"]').fill('Budi Test')
    await customer.locator('input[placeholder="08123456789"]').fill('081234569999')
    await customer.locator('textarea[placeholder*="Jl."]').fill('Jl. Merdeka No. 1')
    await customer.locator('input[placeholder="Palembang"]').fill('Palembang')

    // Continue through checkout steps
    const continueBtn = customer.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await customer.waitForTimeout(400)

    await customer.getByText(/Pengiriman|Shipping/).first().waitFor({ state: 'visible', timeout: 5000 })
    await continueBtn.click()
    await customer.waitForTimeout(400)

    await customer.getByText(/Pembayaran|Payment/).first().waitFor({ state: 'visible', timeout: 5000 })
    await continueBtn.click()
    await customer.waitForTimeout(400)

    // Review step
    await customer.getByText(/Review|Konfirmasi/).first().waitFor({ state: 'visible', timeout: 5000 })
    await expect(customer.getByText('Budi Test')).toBeVisible()

    // Place order and wait for redirect
    await customer.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await customer.waitForURL(/\/order-success\//, { timeout: 20000 })
    await customer.waitForTimeout(1000)

    const orderUrl = customer.url()
    const orderIdMatch = orderUrl.match(/\/order-success\/(DP-[^/]+)/)
    const orderNumber = orderIdMatch[1]

    await expect(customer.getByRole('heading', { name: /Pesanan Berhasil|Order Successful/i })).toBeVisible()

    console.log(`Order created: ${orderNumber}`)

    // ═══════════════════════════════════════════════
    // PHASE 2: Admin confirms payment
    // ═══════════════════════════════════════════════
    await loginAsAdmin(admin)

    // Navigate to orders page and open order detail
    await admin.goto('/admin/orders')
    await admin.waitForTimeout(500)

    // Search for the order in "All" tab
    await admin.locator('div.flex.overflow-x-auto button').filter({ hasText: /Semua|All/i }).click()
    await admin.waitForTimeout(400)
    const searchInput = admin.locator('input[placeholder*="Cari" i]').first()
    await searchInput.fill(orderNumber)
    await admin.waitForTimeout(800)

    // Open order detail
    await admin.getByText(orderNumber).first().click()
    await admin.waitForTimeout(500)

    // Click "Confirm Payment" in the detail modal
    await clickModalButtonByText(admin, /Konfirmasi Bayar|Confirm Payment/i)

    // Verify status via API
    let status = await getOrderStatus(admin, orderNumber)
    expect(status).toBe('paid')
    console.log('Payment confirmed — status:', status)

    // ═══════════════════════════════════════════════
    // PHASE 3: Admin marks ready to ship
    // ═══════════════════════════════════════════════
    await admin.goto('/admin/orders')
    await admin.waitForTimeout(500)

    // Switch to "All" tab to find the order (default is to_ship, order is now paid)
    await admin.locator('div.flex.overflow-x-auto button').nth(0).click()
    await admin.waitForTimeout(400)
    await admin.locator('input[placeholder*="Cari" i]').first().fill(orderNumber)
    await admin.waitForTimeout(800)
    await admin.getByText(orderNumber).first().click()
    await admin.waitForTimeout(500)

    // Click "Mark Ready to Ship" in the detail modal
    await clickModalButtonByText(admin, /Tandai Siap Kirim|Mark Ready to Ship/i)

    // Verify status via API
    status = await getOrderStatus(admin, orderNumber)
    expect(status).toBe('to_ship')
    console.log('Marked ready to ship — status:', status)

    // ═══════════════════════════════════════════════
    // PHASE 4: Admin arranges shipment
    // ═══════════════════════════════════════════════
    await admin.goto('/admin/orders')
    await admin.waitForTimeout(500)

    // Switch to "All" tab (default is to_ship)
    await admin.locator('div.flex.overflow-x-auto button').nth(0).click()
    await admin.waitForTimeout(400)
    await admin.locator('input[placeholder*="Cari" i]').first().fill(orderNumber)
    await admin.waitForTimeout(800)
    const shipBtn = admin.locator('button').filter({ hasText: '📦' }).first()
    await expect(shipBtn).toBeVisible({ timeout: 5000 })
    await shipBtn.click()
    await admin.waitForTimeout(500)

    // Modal should appear
    await admin.locator('div[class*="fixed"][class*="z-50"]').waitFor({ state: 'visible', timeout: 5000 })
    await clickModalButtonByText(admin, /Buat Resi|Generate Resi/i)
    await admin.waitForTimeout(1500)

    // Verify status via API
    status = await getOrderStatus(admin, orderNumber)
    expect(status).toBe('shipping')
    console.log('Shipment arranged — status:', status)

    // ═══════════════════════════════════════════════
    // PHASE 5: Admin marks as completed
    // ═══════════════════════════════════════════════
    await admin.goto('/admin/orders')
    await admin.waitForTimeout(500)

    // Switch to "Shipping" tab (index 4 in STATUS_TABS: All, Unpaid, Paid, To Ship, Shipping, Completed, Cancelled)
    await admin.locator('div.flex.overflow-x-auto button').nth(4).click()
    await admin.waitForTimeout(500)

    // Check the checkbox for the order
    const checkbox = admin.locator(`tr:has-text("${orderNumber}") input[type="checkbox"]`)
    await expect(checkbox).toBeVisible({ timeout: 5000 })
    await checkbox.check()
    await admin.waitForTimeout(300)

    // Click "Complete" bulk action button
    const completeBtn = admin.locator('button').filter({ hasText: /Selesaikan|Complete/i }).first()
    await expect(completeBtn).toBeVisible({ timeout: 5000 })
    await completeBtn.click()
    await admin.waitForTimeout(1000)

    // Verify status via API
    status = await getOrderStatus(admin, orderNumber)
    expect(status).toBe('completed')
    console.log('Order completed — status:', status)

    // ═══════════════════════════════════════════════
    // PHASE 6: Verify customer sees completed status
    // ═══════════════════════════════════════════════
    await customer.goto(`/order-success/${orderNumber}`)
    await customer.waitForTimeout(1000)
    await expect(customer.getByText(orderNumber).first()).toBeVisible()
    await expect(customer.getByText(/Selesai|Completed/i).first()).toBeVisible()

    console.log('Full flow verified successfully')

    await customer.close()
    await admin.close()
  })
})
