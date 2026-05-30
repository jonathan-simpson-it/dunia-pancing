import { test, expect } from '@playwright/test'

test.describe('Full Customer + Admin Flow', () => {

  test('Customer chats, buys; Admin replies, processes order', async ({ browser }) => {
    const customerCtx = await browser.newContext()
    const adminCtx = await browser.newContext()
    const customer = await customerCtx.newPage()
    const admin = await adminCtx.newPage()

    // ═══════════════════════════════════════════════
    // PHASE 1: Customer sends chat message
    // ═══════════════════════════════════════════════
    await customer.goto('/')
    await customer.waitForLoadState('load')

    const chatButton = customer.locator('button[aria-label*="Chat"]')
    await expect(chatButton).toBeVisible()
    await chatButton.click()
    await customer.waitForTimeout(500)

    const chatInput = customer.locator('input[placeholder="Ketik pesan..."]')
    await expect(chatInput).toBeVisible()
    await chatInput.fill('Halo, ada stok joran?')
    await customer.waitForTimeout(300)

    const chatContainer = customer.locator('div.animate-slide-up')
    await chatContainer.locator('button').filter({ has: customer.locator('svg') }).click()
    await customer.waitForTimeout(3000)

    await expect(customer.getByText(/stok|info stok|tersedia/i).first()).toBeVisible({ timeout: 8000 })

    // ═══════════════════════════════════════════════
    // PHASE 2: Customer buys a product
    // ═══════════════════════════════════════════════
    await customer.goto('/product/dp-003')
    await customer.waitForLoadState('load')
    await customer.waitForTimeout(1000)

    await customer.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(customer).toHaveURL('/cart')
    await customer.waitForTimeout(500)

    await customer.goto('/checkout')
    await customer.waitForTimeout(800)

    await customer.locator('input[placeholder="Budi Santoso"]').fill('Budi Test')
    await customer.locator('input[placeholder="08123456789"]').fill('081234569999')
    await customer.locator('textarea[placeholder*="Jl."]').fill('Jl. Merdeka No. 1')
    await customer.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = customer.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await customer.waitForTimeout(400)
    await continueBtn.click()
    await customer.waitForTimeout(400)
    await continueBtn.click()
    await customer.waitForTimeout(400)

    await customer.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/ }).click()
    await customer.waitForTimeout(2000)

    const orderUrl = customer.url()
    expect(orderUrl).toContain('/order-success/')
    await expect(customer.getByRole('heading', { name: /Pesanan Berhasil|Order Successful/i })).toBeVisible({ timeout: 5000 })

    // ═══════════════════════════════════════════════
    // PHASE 3: Admin sees chat + replies
    // ═══════════════════════════════════════════════
    await admin.goto('/login')
    await admin.waitForLoadState('load')

    await admin.getByRole('button', { name: /admin/i }).click()
    await admin.locator('input[placeholder="admin"]').fill('admin')
    await admin.locator('input[type="password"]').fill('admin123')
    await admin.locator('form button[type="submit"]').click()
    await admin.waitForURL(/\/admin/)

    await admin.goto('/admin/chat')
    await admin.waitForTimeout(2000)

    await expect(admin.getByText(/Budi Test|081234569999/i).first()).toBeVisible({ timeout: 8000 })
    await admin.getByText(/Budi Test|081234569999/i).first().click()
    await admin.waitForTimeout(1000)

    await expect(admin.getByText(/ada stok joran/i)).toBeVisible()
    await expect(admin.getByText(/stok|info stok|tersedia/i).first()).toBeVisible()

    const replyInput = admin.locator('input[placeholder="Ketik balasan..."]')
    await expect(replyInput).toBeVisible()
    await replyInput.fill('Stok masih tersedia, silakan cek halaman produk!')
    await admin.getByRole('button', { name: /Kirim|Send/i }).click()
    await admin.waitForTimeout(1000)

    await expect(admin.getByText(/Stok masih tersedia/i)).toBeVisible()

    // ═══════════════════════════════════════════════
    // PHASE 4: Customer sees admin reply
    // ═══════════════════════════════════════════════
    await customer.goto('/')
    await customer.waitForLoadState('load')
    await chatButton.click()
    await customer.waitForTimeout(3000)

    await expect(customer.getByText(/Stok masih tersedia/i).first()).toBeVisible({ timeout: 10000 })

    // ═══════════════════════════════════════════════
    // Cleanup
    // ═══════════════════════════════════════════════
    await customerCtx.close()
    await adminCtx.close()
  })
})
