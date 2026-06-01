import { test, expect } from '@playwright/test'

test.describe('Payment Webhooks & Xendit Integration', () => {

  async function createTestOrder(request) {
    const res = await request.post('/api/orders', {
      data: {
        items: [{ product_id: 'dummy', name_id: 'Test Product', name_en: 'Test Product', image: '', price_idr: 50000, qty: 1 }],
        subtotal: 50000,
        discount: 0,
        total: 65000,
        customer: { name: 'Webhook Tester', phone: '081234560000', address: 'Jl. Test No. 1', city: 'Palembang', notes: '' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000 },
        payment: { id: 'gopay', label: 'GoPay', method: 'ewallet', bank: '-' },
      },
    })
    expect(res.ok()).toBeTruthy()
    const order = await res.json()
    return order
  }

  test('Webhook PAID event marks order as paid', async ({ request }) => {
    const order = await createTestOrder(request)
    expect(order.status).toBe('waiting_payment')

    const webhookRes = await request.post('/api/payments/webhook', {
      data: {
        external_id: order.id,
        id: 'test-inv-001',
        status: 'PAID',
        payment_channel: 'GOPAY',
        payment_method: 'GOPAY',
      },
    })
    expect(webhookRes.ok()).toBeTruthy()
    const result = await webhookRes.json()
    expect(result.success).toBe(true)

    const check = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await check.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.status).toBe('paid')
    expect(updated.paymentId).toBe('test-inv-001')
  })

  test('Webhook EXPIRED event marks order as cancelled', async ({ request }) => {
    const order = await createTestOrder(request)

    const webhookRes = await request.post('/api/payments/webhook', {
      data: {
        external_id: order.id,
        id: 'test-inv-002',
        status: 'EXPIRED',
      },
    })
    expect(webhookRes.ok()).toBeTruthy()

    const check = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await check.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.status).toBe('cancelled')
  })

  test('Webhook without callback token is accepted when no token configured', async ({ request }) => {
    const order = await createTestOrder(request)

    const webhookRes = await request.post('/api/payments/webhook', {
      data: {
        external_id: order.id,
        id: 'test-inv-003',
        status: 'PAID',
      },
    })
    expect(webhookRes.ok()).toBeTruthy()
  })

  test('Webhook duplicate PAID event is idempotent', async ({ request }) => {
    const order = await createTestOrder(request)

    await request.post('/api/payments/webhook', {
      data: { external_id: order.id, id: 'test-inv-004', status: 'PAID' },
    })

    const res2 = await request.post('/api/payments/webhook', {
      data: { external_id: order.id, id: 'test-inv-004', status: 'PAID' },
    })
    expect(res2.ok()).toBeTruthy()
    const result = await res2.json()
    expect(result.dedup).toBe(true)
  })

  test('Webhook payment.capture event (Payments API v3)', async ({ request }) => {
    const order = await createTestOrder(request)

    const webhookRes = await request.post('/api/payments/webhook', {
      data: {
        event: 'payment.capture',
        reference_id: order.id,
        payment_id: 'test-cap-001',
        channel_code: 'GOPAY',
      },
    })
    expect(webhookRes.ok()).toBeTruthy()

    const check = await request.get(`/api/orders?search=${order.orderNumber}&pageSize=1`)
    const checkData = await check.json()
    const updated = checkData.orders?.find((o) => o.id === order.id)
    expect(updated.status).toBe('paid')
  })

  test('Walk-in payment (COD) bypasses Xendit invoice', async ({ page }) => {
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

    await page.locator('input[placeholder="Budi Santoso"]').fill('COD Tester')
    await page.locator('input[placeholder="08123456789"]').fill('081234561111')
    await page.locator('textarea[placeholder*="Jl."]').fill('Jl. COD No. 1')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)
    await continueBtn.click()
    await page.waitForTimeout(400)

    await page.getByText('COD').first().click()
    await page.waitForTimeout(200)
    await continueBtn.click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await page.waitForURL(/\/order-success\//, { timeout: 20000 })
    await expect(page.getByRole('heading', { name: /Pesanan Berhasil|Order Successful/i })).toBeVisible()
    await expect(page.getByText('COD (Bayar di Tempat)').first()).toBeVisible()
  })

  test('Checkout form accepts optional email for notifications', async ({ page }) => {
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

    await page.locator('input[placeholder="Budi Santoso"]').fill('Email Tester')
    await page.locator('input[placeholder="08123456789"]').fill('081234562222')
    await page.locator('textarea[placeholder*="Jl."]').fill('Jl. Email No. 1')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')
    await page.locator('input[type="email"][placeholder="email@example.com"]').fill('tester@example.com')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)
    await continueBtn.click()
    await page.waitForTimeout(400)
    await continueBtn.click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await page.waitForURL(/\/order-success\//, { timeout: 20000 })
  })

  test('Health endpoint reports Xendit key status', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data).toHaveProperty('xenditKeyConfigured')
    expect(data).toHaveProperty('kiriminajaKeyConfigured')
    expect(data).toHaveProperty('testingMode')
  })
})
