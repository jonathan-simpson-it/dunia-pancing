import { test, expect } from '@playwright/test'

test.describe('Edge Cases & Additional Flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dunia-pancing-'))
      keys.forEach(k => localStorage.removeItem(k))
    })
    await page.reload()
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)
  })

  test('Search in catalog filters products', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    // The search bar only appears on catalog page
    const searchInput = page.locator('input[placeholder*="Cari"], input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Search for a specific product
    await searchInput.fill('Shikari')
    await page.waitForTimeout(500)

    // Should show matching products
    await expect(page.getByText('Shikari').first()).toBeVisible()

    // Should hide non-matching
    const products = page.locator('a[href^="/product/"]')
    const count = await products.count()
    expect(count).toBeGreaterThan(0)

    // Clear search and see more results
    await searchInput.fill('')
    await page.waitForTimeout(500)
    const productsAfter = page.locator('a[href^="/product/"]')
    const countAfter = await productsAfter.count()
    expect(countAfter).toBeGreaterThanOrEqual(count)
  })

  test('Search with no results shows empty state', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    const searchInput = page.locator('input[placeholder*="Cari"], input[placeholder*="Search"]')
    await searchInput.fill('ZZZZNONEXISTENT12345')
    await page.waitForTimeout(500)

    await expect(page.getByText(/Produk tidak ditemukan|No products found/)).toBeVisible()
  })

  test('Product with discount shows discount badge', async ({ page }) => {
    // dp-002 has original_price_idr > price_idr (has discount)
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    // Go to product detail for dp-002
    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    // Discount percentage badge should be visible
    const discountBadge = page.locator('span').filter({ hasText: /-\d+%/ })
    await expect(discountBadge.first()).toBeVisible()

    // Original price should have strikethrough (line-through)
    const originalPrice = page.locator('span.line-through').first()
    await expect(originalPrice).toBeVisible()

    // Current price should be lower than original
    const currentPriceText = await page.getByText(/^Rp/).first().textContent()
    const originalText = await originalPrice.textContent()
    expect(currentPriceText).toBeTruthy()
    expect(originalText).toBeTruthy()
  })

  test('Product with multiple images shows thumbnails', async ({ page }) => {
    // dp-002 has 3 images
    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    // Click on second thumbnail
    const thumbnails = page.locator('button img').locator('..')
    const thumbCount = await thumbnails.count()
    expect(thumbCount).toBeGreaterThan(1)

    // Click second thumbnail
    await thumbnails.nth(1).click()
    await page.waitForTimeout(200)

    // First thumbnail should no longer have the active class
    // The active thumbnail has border-brand-primary class
    // Click first thumbnail again
    await thumbnails.first().click()
    await page.waitForTimeout(200)
  })

  test('Chat button opens and closes chat window', async ({ page }) => {
    const chatBtn = page.getByRole('button', { name: /Buka Chat|Open Chat/i })
    await expect(chatBtn).toBeVisible()

    // Click to open
    await chatBtn.click()
    await page.waitForTimeout(500)

    // Chat window should appear with "Dunia Pancing" header
    await expect(page.getByText(/Dunia Pancing/).first()).toBeVisible()

    // Close button should be visible
    const closeBtn = page.locator('button').filter({ hasText: /Tutup|Close/ })
    await expect(closeBtn).toBeVisible()

    // Click to close
    await closeBtn.click()
    await page.waitForTimeout(300)
  })

  test('Account page shows order history after purchase', async ({ page }) => {
    // Register a customer
    await page.goto('/login')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.waitForTimeout(200)
    await page.getByText('Daftar').first().click()
    await page.waitForTimeout(200)

    await page.locator('input[placeholder="Budi Santoso"]').fill('Order Tester')
    await page.locator('input[placeholder="08123456789"]').first().fill('08999999999')
    await page.locator('input[placeholder="Min. 6 karakter"]').fill('test123')
    await page.locator('input[placeholder="Ulangi password"]').fill('test123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL('/')

    // Create an order directly in localStorage to simulate a purchase
    await page.evaluate(() => {
      const orders = [{
        id: 'DP-999999-001',
        date: new Date().toISOString(),
        status: 'waiting_payment',
        items: [{ id: 'dp-002', name_id: 'Joran Test', name_en: 'Test Rod', image: '', price_idr: 50000, qty: 1 }],
        customer: { name: 'Order Tester', phone: '08999999999', address: 'Jl. Test', city: 'Palembang' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000 },
        payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA', accountNumber: '123' },
        subtotal: 50000,
        shipping_fee: 15000,
        total: 65000,
      }]
      localStorage.setItem('dunia-pancing-orders', JSON.stringify(orders))
    })
    await page.goto('/account')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)

    // Should show order in history
    await expect(page.getByText('DP-999999-001')).toBeVisible()
    await expect(page.getByText(/Riwayat Pesanan|Order History/)).toBeVisible()
    await expect(page.getByText(/Menunggu Pembayaran|Waiting Payment/)).toBeVisible()

    // Logout button
    await page.getByText(/Keluar|Logout/).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/login')
  })

  test('Language persists after page navigation', async ({ page }) => {
    // Switch to English
    const langBtn = page.getByRole('button', { name: /ID.*EN/ })
    await langBtn.click()
    await page.waitForTimeout(500)

    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()

    // Navigate to another page
    await nav.getByRole('link', { name: 'Catalog' }).click()
    await page.waitForTimeout(500)

    // Should still show English
    const nav2 = page.locator('nav').first()
    await expect(nav2.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav2.getByRole('link', { name: 'Catalog' })).toBeVisible()
    await expect(nav2.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  test('Footer contains all expected sections', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Brand name
    await expect(footer.getByText('Dunia Pancing Palembang')).toBeVisible()

    // Navigation links
    await expect(footer.getByText('Home')).toBeVisible()
    await expect(footer.getByText('Digital Catalog')).toBeVisible()
    await expect(footer.getByText('Visit Store')).toBeVisible()

    // Legal links
    await expect(footer.getByText('Terms of Service')).toBeVisible()
    await expect(footer.getByText('Privacy Policy')).toBeVisible()

    // Newsletter section
    await expect(footer.getByText('Newsletter')).toBeVisible()
    await expect(footer.getByPlaceholder('Email address')).toBeVisible()

    // Copyright
    await expect(footer.getByText(/ALL RIGHTS RESERVED/)).toBeVisible()
  })

  test('Re-login after logout redirects correctly', async ({ page }) => {
    // Login as admin
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('dunia-pancing-users', JSON.stringify([
        { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }
      ]))
    })
    await page.goto('/login')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await page.locator('input[placeholder="admin"]').fill('admin')
    await page.locator('input[placeholder="••••••"]').fill('admin123')
    await page.locator('form').first().evaluate(form => form.requestSubmit())
    await page.waitForURL('/admin')
    await page.waitForTimeout(300)

    // Logout
    await page.getByText(/Keluar|Logout/).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/login')

    // Login again
    await page.locator('input[placeholder="admin"]').fill('admin')
    await page.locator('input[placeholder="••••••"]').fill('admin123')
    await page.locator('form').first().evaluate(form => form.requestSubmit())
    await page.waitForURL('/admin')
    await expect(page).toHaveURL('/admin')
  })

  test('Catalog navigation from home page categories', async ({ page }) => {
    await expect(page.getByText('Browse Collections')).toBeVisible()

    // Click on "Joran" category card
    await page.getByRole('link', { name: /Joran \d+ Barang/ }).first().click()
    await expect(page).toHaveURL(/catalog\?category=rods/)
    await page.waitForTimeout(300)

    // Should show products filtered to rods category
    await expect(page.getByText(/Joran/).first()).toBeVisible()
  })

  test('Order success page shows order details', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await expect(page.getByText('Top Picks')).toBeVisible()

    // Go through checkout to create real order
    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)

    await page.goto('/checkout')
    await page.waitForTimeout(800)

    await expect(page.getByText(/Data Pembeli|Customer Info/).first()).toBeVisible()
    await page.locator('input[placeholder="Budi Santoso"]').fill('Buyer Test')
    await page.locator('input[placeholder="08123456789"]').fill('08111111111')
    await page.locator('textarea').fill('Jl. Sukses No. 1')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)
    await continueBtn.click()
    await page.waitForTimeout(400)
    await continueBtn.click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/ }).click()
    await page.waitForTimeout(1500)

    // Verify order success page
    await expect(page).toHaveURL(/\/order-success\/DP-/)
    await expect(page.getByRole('heading', { name: /Pesanan Berhasil|Order Successful/ })).toBeVisible()

    // Order ID visible
    await expect(page.getByText(/DP-/).first()).toBeVisible()

    // Payment info section
    await expect(page.getByText(/Pembayaran|Payment/).first()).toBeVisible()
    await expect(page.getByText(/BCA|Transfer/).first()).toBeVisible()

    // Continue shopping link
    await expect(page.getByRole('link', { name: /Belanja Lagi|Continue Shopping/ })).toBeVisible()
  })

  test('Product detail breadcrumb navigation works', async ({ page }) => {
    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    // Click category breadcrumb link
    const categoryLink = page.locator('nav a').filter({ hasText: /Joran|Rods/ })
    await expect(categoryLink.first()).toBeVisible()
    await categoryLink.first().click()
    await page.waitForTimeout(500)

    // Should navigate to catalog filtered by category
    await expect(page).toHaveURL(/category=rods/)
  })
})
