import { test, expect } from '@playwright/test'
import { loginAsAdmin, clearState } from './helpers'

test.describe('Admin: Comprehensive Feature Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearState(page)
  })

  test('Admin dashboard sidebar has all navigation links', async ({ page }) => {
    await loginAsAdmin(page)
    const sidebar = page.locator('aside')
    await expect(sidebar.getByRole('link', { name: /produk|products/i }).first()).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /pesanan/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /tambah produk/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /voucher/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /import/i })).toBeVisible()
    await expect(sidebar.getByRole('link', { name: /pendapatan/i })).toBeVisible()
  })

  test('Admin sidebar logout button is visible', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.locator('aside').getByRole('button', { name: /keluar/i })).toBeVisible()
  })

  test('Admin product table has products listed', async ({ page }) => {
    await loginAsAdmin(page)
    const table = page.locator('table')
    const rows = table.locator('tbody tr')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(10)
    await expect(rows.first().getByRole('button', { name: /edit/i })).toBeVisible()
    await expect(rows.first().getByRole('button', { name: /hapus/i })).toBeVisible()
  })

  test('Admin can edit a product inline', async ({ page }) => {
    await loginAsAdmin(page)
    const firstEditBtn = page.locator('table tbody tr').first().getByRole('button', { name: /edit/i })
    await firstEditBtn.click()
    await expect(page.getByRole('button', { name: /simpan|save/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /batal|cancel/i }).first()).toBeVisible()
    await page.getByRole('button', { name: /batal|cancel/i }).first().click()
  })

  test('Admin can delete a product', async ({ page }) => {
    await loginAsAdmin(page)
    const row = page.locator('table tbody tr').filter({ hasText: 'Joran 21 Shikari' })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: /hapus/i }).click()
    await expect(page.getByRole('button', { name: /hapus/i }).first()).toBeVisible()
  })

  test('Admin add product form has all required fields', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/add')
    await expect(page.getByText(/nama produk.*indonesia/i)).toBeVisible()
    await expect(page.getByText(/nama produk.*english/i)).toBeVisible()
    await expect(page.getByText(/merek|brand/i)).toBeVisible()
    await expect(page.getByText(/harga.*rp|price/i).first()).toBeVisible()
    await expect(page.getByText(/stok|stock/i).first()).toBeVisible()
    await expect(page.getByText(/berat|weight/i)).toBeVisible()
    await page.getByRole('button', { name: /simpan|save/i }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: /simpan|save/i })).toBeVisible()
  })

  test('Admin can navigate to add product form', async ({ page }) => {
    await loginAsAdmin(page)
    await page.locator('aside').getByRole('link', { name: /tambah produk/i }).click()
    await page.waitForURL('/admin/add')
  })

  test('Admin categories tab shows category management', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByRole('button', { name: /kategori/i }).click()
    await expect(page.getByText(/tambah|add/i).first()).toBeVisible()
  })

  test('Admin import page shows upload and download options', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/import')
    await expect(page.getByText(/seret|drag|csv|excel|unggah|upload/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /download.*csv|csv.*template/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /download.*excel|excel.*template/i })).toBeVisible()
  })

  test('Admin revenue page shows stats sections', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/revenue')
    await expect(page.getByText(/total pendapatan|total revenue/i)).toBeVisible()
    await expect(page.getByText(/produk.*terlaris|produk.*populer/i)).toBeVisible()
  })

  test('Admin revenue page with zero orders shows empty state', async ({ page }) => {
    await loginAsAdmin(page)
    await page.evaluate(() => {
      localStorage.setItem('dunia-pancing-orders', JSON.stringify([]))
    })
    await page.goto('/admin/revenue')
    await expect(page.getByText(/belum ada|no data/i).first()).toBeVisible()
  })

  test('Admin orders page shows status filter tabs', async ({ page }) => {
    await loginAsAdmin(page)
    await page.evaluate(() => localStorage.setItem('dunia-pancing-orders', JSON.stringify([])))
    await page.goto('/admin/orders')
    await page.waitForLoadState('load')
    await expect(page.getByRole('button', { name: /semua|all/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /menunggu|unpaid/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /dibayar|paid/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /dikirim|shipping/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /selesai|completed/i })).toBeVisible()
  })

  test('Admin bulk order checkboxes appear in orders table', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    await page.waitForLoadState('load')
    await page.waitForTimeout(1000)
    const checkboxes = page.locator('table input[type="checkbox"]')
    const cbCount = await checkboxes.count()
    expect(cbCount).toBeGreaterThan(0)
  })

  test('Admin logout button in sidebar works', async ({ page }) => {
    await loginAsAdmin(page)
    await page.locator('aside').getByRole('button', { name: /keluar/i }).click()
    await page.waitForTimeout(1500)
    expect(page.url()).toContain('/login')
  })
})
