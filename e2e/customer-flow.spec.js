import { test, expect } from '@playwright/test'

test.describe('Customer Buying Flow (Priority)', () => {

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

  test('Home page loads with all sections visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: /DUNIA PANCING Palembang/ })).toBeVisible()
    await expect(page.getByText('Palembang • Indonesia').first()).toBeVisible()

    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Beranda' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Katalog' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Kontak' })).toBeVisible()

    await expect(page.getByRole('link', { name: 'Lihat Katalog' })).toBeVisible()
    await expect(page.getByText('Browse Collections')).toBeVisible()
    await expect(page.getByText('Top Picks')).toBeVisible()
    await expect(page.getByText('Paling Laris')).toBeVisible()
    await expect(page.getByText('Barang Asli')).toBeVisible()
    await expect(page.getByText('Pengiriman Cepat')).toBeVisible()
    await expect(page.getByText('Konsultasi Gratis')).toBeVisible()
    await expect(page.getByText('Mitra Terpercaya Sejak 1998')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Shop Now' })).toBeVisible()
  })

  test('Navigation links work correctly', async ({ page }) => {
    const nav = page.locator('nav').first()

    await nav.getByRole('link', { name: 'Katalog' }).click()
    await expect(page).toHaveURL('/catalog')

    await nav.getByRole('link', { name: 'Kontak' }).click()
    await expect(page).toHaveURL('/contact')

    await page.getByRole('link', { name: /DUNIA PANCING Palembang/ }).click()
    await expect(page).toHaveURL('/')

    await page.getByRole('link', { name: 'Masuk' }).click()
    await expect(page).toHaveURL('/login')

    await page.locator('a[href="/cart"]').first().click()
    await expect(page).toHaveURL('/cart')
  })

  test('Catalog page: browse, filter, sort', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await expect(page.getByText('Home').first()).toBeVisible()
    await expect(page.getByText(/Katalog|Catalog/).first()).toBeVisible()

    await expect(page.getByRole('button', { name: /Semua \d+/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Joran \d+/ })).toBeVisible()

    await page.getByRole('button', { name: /Joran \d+/ }).click()
    await page.waitForTimeout(300)
    await expect(page).toHaveURL(/category=rods/)

    await expect(page.getByRole('button', { name: 'Relevansi' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Terbaru' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Terlaris' })).toBeVisible()
    // "Harga" matches both "Harga" and "Harga Tertinggi" - use exact
    await expect(page.getByRole('button', { name: 'Harga', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Harga', exact: true }).click()
    await page.waitForTimeout(200)

    const productLink = page.locator('a[href^="/product/"]').first()
    await expect(productLink).toBeVisible()
    await productLink.click()
    await expect(page).toHaveURL(/\/product\/dp-/)
  })

  test('Product detail page displays correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await expect(page.getByText('Top Picks')).toBeVisible()

    // First product is dp-002 with name "Joran 21 Shikari"
    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await expect(page.getByText('Joran 21 Shikari').first()).toBeVisible()
    await expect(page.getByText('Shikari').first()).toBeVisible()
    await expect(page.getByText(/Stok|Stock/)).toBeVisible()

    await expect(page.getByRole('button', { name: /\+ Keranjang|Add to Cart|Keranjang/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Beli Langsung|Buy Now/i })).toBeVisible()
  })

  test('Buy Now adds to cart and redirects', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await expect(page.getByText('Top Picks')).toBeVisible()

    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    const buyBtn = page.getByRole('button', { name: /Beli Langsung|Buy Now/i })
    await expect(buyBtn).toBeVisible()
    await buyBtn.click()

    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)
    await expect(page.getByText('Joran 21 Shikari')).toBeVisible()
  })

  test('Cart operations: qty update and remove', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await expect(page.getByText('Top Picks')).toBeVisible()

    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)

    await expect(page.getByText('Joran 21 Shikari')).toBeVisible()

    const plusBtn = page.getByRole('button', { name: '+' }).first()
    await plusBtn.click()
    await page.waitForTimeout(200)

    await page.getByRole('button', { name: 'Hapus', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Keranjang belanja kosong')).toBeVisible()
  })

  test('Full checkout flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    await expect(page.getByText('Top Picks')).toBeVisible()

    await page.goto('/product/dp-002')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)

    await page.getByRole('button', { name: /Beli Langsung|Buy Now/i }).click()
    await expect(page).toHaveURL('/cart')
    await page.waitForTimeout(500)

    await page.goto('/checkout')
    await page.waitForTimeout(800)

    await expect(page.getByText(/Data Pembeli|Customer Info/).first()).toBeVisible()
    await page.locator('input[placeholder="Budi Santoso"]').fill('John Doe')
    await page.locator('input[placeholder="08123456789"]').fill('081234567890')
    await page.locator('textarea[placeholder*="Jl."]').fill('Jl. Testing No. 123')
    await page.locator('input[placeholder="Palembang"]').fill('Palembang')

    const continueBtn = page.getByRole('button', { name: /Lanjutkan|Continue/ })
    await continueBtn.click()
    await page.waitForTimeout(400)

    await expect(page.getByText(/Pengiriman|Shipping/).first()).toBeVisible()
    await continueBtn.click()
    await page.waitForTimeout(400)

    await expect(page.getByText(/Pembayaran|Payment/).first()).toBeVisible()
    await continueBtn.click()
    await page.waitForTimeout(400)

    await expect(page.getByText(/Review|Konfirmasi/).first()).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('081234567890')).toBeVisible()

    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/ }).click()
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/order-success\/DP-/)
    await expect(page.getByText(/Pesanan Berhasil|Order Successful/)).toBeVisible()
  })

  test('Language toggle switches between ID and EN', async ({ page }) => {
    await expect(page.locator('nav').first().getByRole('link', { name: 'Beranda' })).toBeVisible()

    const langBtn = page.getByRole('button', { name: /ID.*EN/ })
    await langBtn.click()
    await page.waitForTimeout(500)

    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Catalog' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible()
  })

  test('Contact page renders', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForTimeout(500)
    await expect(page.getByText('Hubungi Kami')).toBeVisible()
    await expect(page.getByRole('link', { name: /WhatsApp/i })).toBeVisible()
  })

  test('Login page tabs work', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(500)

    await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Pelanggan|Customer/ })).toBeVisible()
    await expect(page.locator('input[placeholder="admin"]')).toBeVisible()

    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Masuk').first()).toBeVisible()
    await expect(page.getByText('Daftar').first()).toBeVisible()
  })

  test('Customer registration', async ({ page }) => {
    await page.goto('/login')
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.waitForTimeout(200)
    await page.getByText('Daftar').first().click()
    await page.waitForTimeout(200)

    await page.locator('input[placeholder="Budi Santoso"]').fill('Test User')
    await page.locator('input[placeholder="08123456789"]').first().fill('081234567890')
    await page.locator('input[placeholder="Min. 6 karakter"]').fill('test123')
    await page.locator('input[placeholder="Ulangi password"]').fill('test123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL('/')
  })

  test('Admin login redirects to dashboard', async ({ page }) => {
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
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL('/admin')
  })
})
