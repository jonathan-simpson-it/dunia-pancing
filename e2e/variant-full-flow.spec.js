import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('Variant Full Flow: Add → Buy → Process → Stock Deducted', () => {

  test('Complete variant flow: admin adds product with variants → buys → processes → stock verified', async ({ browser }) => {
    test.slow()

    const adminCtx = await browser.newContext({ storageState: undefined })
    const admin = await adminCtx.newPage()
    const customerCtx = await browser.newContext({ storageState: undefined })
    const customer = await customerCtx.newPage()

    // ═════════════════════════════════════════════════════════
    // PHASE 1: Admin adds product "Maguro Test" with variant "Warna" (Merah / Biru)
    // ═════════════════════════════════════════════════════════
    await loginAsAdmin(admin)
    await admin.goto('/admin/add')
    await admin.waitForTimeout(500)

    const inputs = admin.locator('form input:not([type="file"])')
    await inputs.nth(0).fill('Maguro Test')
    await inputs.nth(1).fill('Maguro Test EN')
    await inputs.nth(2).fill('TestBrand')
    await inputs.nth(3).fill('100000')
    await inputs.nth(4).fill('125000')
    await inputs.nth(5).fill('0')
    await inputs.nth(6).fill('250')

    await admin.getByRole('button', { name: /Atur Varian Produk|Manage Product Variants/ }).click()
    await admin.waitForTimeout(400)

    await admin.getByPlaceholder(/Nama tipe varian|Variant type name/).fill('Warna')
    await admin.getByRole('button', { name: /Tambah Tipe|Add Type/ }).click()
    await admin.waitForTimeout(400)

    const valueInput = admin.getByPlaceholder(/Nilai varian|Variant value/)
    const addValueBtn = valueInput.locator('..').getByRole('button')
    await valueInput.fill('Merah')
    await addValueBtn.click()
    await admin.waitForTimeout(200)
    await valueInput.fill('Biru')
    await addValueBtn.click()
    await admin.waitForTimeout(200)

    await admin.getByPlaceholder(/Harga massal|Bulk price/).fill('100000')
    await admin.getByRole('button', { name: /Semua Harga Sama|All Same Price/ }).click()
    await admin.waitForTimeout(200)

    await admin.getByPlaceholder(/Stok massal|Bulk stock/).fill('5')
    await admin.getByRole('button', { name: /Terapkan Stok|Set Stock/ }).click()
    await admin.waitForTimeout(300)

    for (const label of ['Merah', 'Biru']) {
      const row = admin.locator('tr').filter({ hasText: label })
      await row.locator('input').nth(0).fill(`SKU-${label.toUpperCase()}`)
      await row.locator('input').nth(1).fill('100000')
      await row.locator('input').nth(2).fill('5')
      await row.locator('input').nth(3).fill('250')
    }

    await admin.getByRole('button', { name: /Simpan|Save/ }).click()
    await admin.waitForURL('/admin', { timeout: 10000 })

    const newProductId = await admin.evaluate(() => {
      const raw = localStorage.getItem('dunia-pancing-products')
      if (!raw) return ''
      const products = JSON.parse(raw)
      const found = products.find(p => p.name_id === 'Maguro Test')
      return found ? found.id : ''
    })
    expect(newProductId).toBeTruthy()
    console.log('Created product ID:', newProductId)

    // ═════════════════════════════════════════════════════════
    // PHASE 2: Customer buys "Merah" variant (guest browser)
    // ═════════════════════════════════════════════════════════
    await customer.goto(`/product/${newProductId}`)
    await customer.waitForLoadState('load')
    await customer.waitForTimeout(1000)

    const merahSelector = customer.getByRole('button', { name: 'Merah', exact: true }).first()
    const biruSelector = customer.getByRole('button', { name: 'Biru', exact: true }).first()
    await expect(merahSelector).toBeVisible({ timeout: 5000 })
    await expect(biruSelector).toBeVisible({ timeout: 5000 })

    await merahSelector.click()
    await customer.waitForTimeout(300)

    const addCartBtn = customer.getByRole('button', { name: /\+ Keranjang|\+ Cart/i }).first()
    await expect(addCartBtn).toBeVisible()
    await addCartBtn.click()
    await customer.waitForTimeout(500)

    await customer.goto('/cart')
    await customer.waitForTimeout(500)
    await expect(customer.getByText('Maguro Test').first()).toBeVisible()

    // ═════════════════════════════════════════════════════════
    // PHASE 3: Guest checkout
    // ═════════════════════════════════════════════════════════
    await customer.goto('/checkout')
    await customer.waitForTimeout(800)

    // Guest — customer info step is always visible
    await customer.locator('input[placeholder="Budi Santoso"]').fill('Budi Variant Test')
    await customer.locator('input[placeholder="08123456789"]').fill('081234569999')
    await customer.locator('textarea[placeholder*="Jl."]').fill('Jl. Variant No. 1')
    await customer.locator('input[placeholder="Palembang"]').fill('Palembang')

    for (let step = 0; step < 3; step++) {
      const contBtn = customer.getByRole('button', { name: /Lanjutkan|Continue/ })
      await expect(contBtn).toBeVisible({ timeout: 5000 })
      await contBtn.click()
      await customer.waitForTimeout(400)
    }

    await customer.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/i }).click()
    await customer.waitForURL(/\/order-success\//, { timeout: 20000 })
    await customer.waitForTimeout(1000)

    const orderUrl = customer.url()
    const orderIdMatch = orderUrl.match(/\/order-success\/(DP-[^/]+)/)
    expect(orderIdMatch).toBeTruthy()
    const orderNumber = orderIdMatch[1]
    console.log('Order placed:', orderNumber)

    // ═════════════════════════════════════════════════════════
    // PHASE 4: Admin processes order via direct API calls
    // ═════════════════════════════════════════════════════════

    async function setOrderStatus(status, note) {
      const resp = await admin.request.put(`/api/orders/${orderNumber}`, {
        data: { status, note: note || status },
      })
      expect(resp.ok()).toBeTruthy()
      const updated = await resp.json()
      return updated.status
    }

    let status = await setOrderStatus('paid')
    expect(status).toBe('paid')
    console.log('Payment confirmed →', status)

    status = await setOrderStatus('to_ship')
    expect(status).toBe('to_ship')
    console.log('Ready to ship →', status)

    const shipResp = await admin.request.put(`/api/orders/${orderNumber}`, {
      data: {
        status: 'shipping',
        courier: 'jne_reg',
        courierLabel: 'JNE Regular',
        awbNumber: 'TEST1234567890',
        note: 'Shipped via test',
      },
    })
    expect(shipResp.ok()).toBeTruthy()
    status = (await shipResp.json()).status
    expect(status).toBe('shipping')
    console.log('Shipped →', status)

    status = await setOrderStatus('completed')
    expect(status).toBe('completed')
    console.log('Completed →', status)

    // ═════════════════════════════════════════════════════════
    // PHASE 5: Verify variant tracking AND stock deduction
    // ═════════════════════════════════════════════════════════
    const orderResp = await admin.request.get(`/api/orders/${orderNumber}`)
    expect(orderResp.ok()).toBeTruthy()
    const orderData = await orderResp.json()
    expect(orderData.items[0].variantId).toBeTruthy()
    expect(orderData.items[0].variantLabel).toBeTruthy()
    console.log('Order item variantId:', orderData.items[0].variantId, 'variantLabel:', orderData.items[0].variantLabel)

    const productResp = await admin.request.get(`/api/products/${newProductId}`)
    expect(productResp.ok()).toBeTruthy()
    const productData = await productResp.json()

    const warnaType = productData.variantTypes[0]
    expect(warnaType).toBeTruthy()
    const merahValue = warnaType.values.find(v => v.label === 'Merah')
    expect(merahValue).toBeTruthy()

    const merahVariant = productData.productVariants.find(v => {
      const combo = JSON.parse(v.combination)
      return combo[warnaType.id] === merahValue.id
    })
    expect(merahVariant).toBeTruthy()
    expect(merahVariant.stockQty).toBe(4)
    console.log('Merah variant stock after order:', merahVariant.stockQty, '(expected 4)')

    await customer.goto(`/order-success/${orderNumber}`)
    await customer.waitForTimeout(1000)
    await expect(customer.getByText(orderNumber).first()).toBeVisible()

    console.log('Full variant flow verified successfully!')

    await customerCtx.close()
    await adminCtx.close()
  })
})
