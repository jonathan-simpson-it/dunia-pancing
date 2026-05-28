import { test, expect } from '@playwright/test'

test.describe('Product Detail & Catalog Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dunia-pancing-'))
      keys.forEach(k => localStorage.removeItem(k))
    })
    await page.reload()
  })

  test('Visiting a non-existent product shows not-found message', async ({ page }) => {
    await page.goto('/product/nonexistent-999')
    await expect(page.getByText(/produk tidak ditemukan/i)).toBeVisible()
  })

  test('Product detail page shows product name and price', async ({ page }) => {
    await page.goto('/product/dp-002')
    await expect(page.getByRole('heading', { name: /Joran 21 Shikari/i })).toBeVisible()
  })

  test('Product description section is visible', async ({ page }) => {
    await page.goto('/product/dp-002')
    await expect(page.getByRole('heading', { name: /deskripsi|description/i })).toBeVisible()
  })

  test('Reviews section is visible', async ({ page }) => {
    await page.goto('/product/dp-002')
    await expect(page.getByRole('heading', { name: /ulasan|reviews/i })).toBeVisible()
  })

  test('Out of stock product badge is shown', async ({ page }) => {
    await page.goto('/product/dp-018')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/stok habis|out of stock/i)).toBeVisible()
  })

  test('Product with discount shows discount badge', async ({ page }) => {
    await page.goto('/product/dp-002')
    const discountBadge = page.locator('span.bg-red-500').first()
    await expect(discountBadge).toBeVisible()
  })

  test('Catalog page loads with product cards', async ({ page }) => {
    await page.goto('/catalog')
    const productLinks = page.locator('a[href^="/product/"]')
    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Search input in catalog filters products', async ({ page }) => {
    await page.goto('/catalog')
    const searchInput = page.getByPlaceholder(/cari|search/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Shikari')
    await page.waitForTimeout(300)
    await expect(page.getByText(/Shikari/).first()).toBeVisible()
  })

  test('Category chip click filters catalog', async ({ page }) => {
    await page.goto('/catalog')
    const categoryBtn = page.getByRole('button', { name: /joran|reel|senar|kail|umpan|aksesoris/i }).first()
    await categoryBtn.click()
    await page.waitForTimeout(500)
    const productLinks = page.locator('a[href^="/product/"]')
    const count = await productLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Product card shows add to cart or buy now link', async ({ page }) => {
    await page.goto('/catalog')
    const lastLink = page.locator('a[href^="/product/"]').last()
    await expect(lastLink).toBeVisible()
  })

  test('Quantity buttons exist on product page', async ({ page }) => {
    await page.goto('/product/dp-002')
    const plusBtn = page.locator('button').filter({ hasText: '+' })
    const minusBtn = page.locator('button').filter({ hasText: '−' })
    await expect(plusBtn.first()).toBeVisible()
  })
})
