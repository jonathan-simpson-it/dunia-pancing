import { test, expect } from '@playwright/test'

test.describe('KiriminAja & Xendit Payment Integration', () => {

  test('Bank transfer bypasses Xendit and shows bank info', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)

    await page.goto('/product/dp-003')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)

    await page.goto('/checkout')
    await page.waitForTimeout(800)

    await page.locator('input[placeholder="Budi Santoso"]').fill('Bank Transfer Test')
    await page.locator('input[placeholder="08123456789"]').fill('081234567001')
    await page.locator('textarea[placeholder*="Jl."]').fill('Jl. Bank No. 1')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)

    await continueBtn.click()
    await page.waitForTimeout(400)

    // Payment step - BCA should be selected by default
    await page.getByText('Transfer BCA').first().waitFor({ state: 'visible', timeout: 5000 })
    await continueBtn.click()
    await page.waitForTimeout(400)

    // Review step - place order
    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await page.waitForURL(/\/order-success\//, { timeout: 20000 })
    await page.waitForTimeout(2000)

    // Should redirect to order-success directly (not to Xendit)
    await expect(page.getByText(/Pesanan Berhasil|Order Successful/).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Info Pembayaran/).first()).toBeVisible()
    await expect(page.getByText(/Transfer BCA/).first()).toBeVisible()
  })

  test('COD flow shows COD message on success page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)

    await page.goto('/product/dp-003')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)

    await page.goto('/checkout')
    await page.waitForTimeout(800)

    await page.locator('input[placeholder="Budi Santoso"]').fill('COD Test')
    await page.locator('input[placeholder="08123456789"]').fill('081234567002')
    await page.locator('textarea[placeholder*="Jl."]').fill('Jl. COD No. 1')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)

    await continueBtn.click()
    await page.waitForTimeout(400)

    // Select COD payment
    await page.getByText('COD (Bayar di Tempat)').first().click()
    await page.waitForTimeout(200)
    await continueBtn.click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await page.waitForURL(/\/order-success\//, { timeout: 20000 })
    await page.waitForTimeout(500)

    await expect(page.getByText('COD (Bayar di Tempat)').first()).toBeVisible()
  })

  test('District search API proxy works', async ({ request }) => {
    const res = await request.post('/api/kiriminaja/search-district', {
      data: { search: 'Ilir Timur' },
    })
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('status')
  })

  test('KiriminAja webhook - finished_packages auto-completes COD order', async ({ request }) => {
    // Create a COD order
    const orderRes = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'dummy', name_id: 'COD Test', name_en: 'COD Test', image: '', price_idr: 50000, qty: 1 }],
        subtotal: 50000,
        discount: 0,
        total: 65000,
        customer: { name: 'COD Webhook', phone: '081234567003', address: 'Jl. Test', city: 'Palembang' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000, service_type: 'REG23' },
        payment: { id: 'cod', label: 'COD (Bayar di Tempat)', method: 'cod', bank: '-' },
        kecamatan: 'Ilir Timur I',
        kecamatanId: 548,
      },
    })
    expect(orderRes.ok()).toBeTruthy()
    const order = await orderRes.json()

    // Simulate KiriminAja webhook: processed_packages (AWB created)
    const awbRes = await request.post('/api/kiriminaja/webhook', {
      data: {
        method: 'processed_packages',
        data: [{ order_id: order.id, awb: 'COD-TEST-AWB-001' }],
      },
      headers: { Authorization: `Bearer ${process.env.KIRIMINAJA_API_KEY || ''}` },
    })
    // Should accept webhook even with empty API key (since verifyAuth returns true for empty key for now)
    expect(awbRes.ok()).toBeTruthy()

    // Simulate KiriminAja webhook: finished_packages (delivered)
    const finishRes = await request.post('/api/kiriminaja/webhook', {
      data: {
        method: 'finished_packages',
        data: [{ order_id: order.id, awb: 'COD-TEST-AWB-001', finished_at: new Date().toISOString() }],
      },
      headers: { Authorization: `Bearer ${process.env.KIRIMINAJA_API_KEY || ''}` },
    })
    expect(finishRes.ok()).toBeTruthy()

    // Verify order status is now completed (auto-completed for COD)
    const checkRes = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await checkRes.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.status).toBe('completed')
  })

  test('KiriminAja webhook - processed_packages stores AWB', async ({ request }) => {
    const orderRes = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'dummy', name_id: 'AWB Test', name_en: 'AWB Test', image: '', price_idr: 30000, qty: 1 }],
        subtotal: 30000,
        discount: 0,
        total: 45000,
        customer: { name: 'AWB Test', phone: '081234567004', address: 'Jl. AWB', city: 'Palembang' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000, service_type: 'REG23' },
        payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA' },
        kecamatanId: 548,
      },
    })
    expect(orderRes.ok()).toBeTruthy()
    const order = await orderRes.json()

    await request.post('/api/kiriminaja/webhook', {
      data: {
        method: 'processed_packages',
        data: [{ order_id: order.id, awb: 'AWB-1234567890' }],
      },
    })

    const checkRes = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await checkRes.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.awbNumber).toBe('AWB-1234567890')
  })

  test('KiriminAja webhook - canceled_packages cancels order', async ({ request }) => {
    const orderRes = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'dummy', name_id: 'Cancel Test', name_en: 'Cancel Test', image: '', price_idr: 20000, qty: 1 }],
        subtotal: 20000,
        discount: 0,
        total: 35000,
        customer: { name: 'Cancel Test', phone: '081234567005', address: 'Jl. Cancel', city: 'Palembang' },
        shipping: { id: 'jnt', label: 'J&T Express', fee: 15000, service_type: 'REG' },
        payment: { id: 'gopay', label: 'GoPay', method: 'ewallet', bank: '-' },
        kecamatanId: 548,
      },
    })
    expect(orderRes.ok()).toBeTruthy()
    const order = await orderRes.json()

    await request.post('/api/kiriminaja/webhook', {
      data: {
        method: 'canceled_packages',
        data: [{ order_id: order.id, awb: 'CANCEL-001', reason: 'Customer cancelled' }],
      },
    })

    const checkRes = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await checkRes.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.status).toBe('cancelled')
  })

  test('Health endpoint reports configuration status', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('xenditKeyConfigured')
    expect(data).toHaveProperty('kiriminajaKeyConfigured')
    expect(data).toHaveProperty('testingMode')
  })

  test('Checkout form stores kecamatan in order', async ({ page, request }) => {
    // Place order with kecamatan info via API
    const orderRes = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'dummy', name_id: 'Kec Test', name_en: 'Kec Test', image: '', price_idr: 10000, qty: 1 }],
        subtotal: 10000,
        discount: 0,
        total: 25000,
        customer: { name: 'Kec Test', phone: '081234567006', address: 'Jl. Kec', city: 'Palembang', notes: '' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000, service_type: 'REG23' },
        payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA' },
        kecamatan: 'Ilir Timur I',
        kecamatanId: 548,
      },
    })
    expect(orderRes.ok()).toBeTruthy()
    const order = await orderRes.json()
    expect(order.customerNote).toContain('Ilir Timur I')
  })
})
