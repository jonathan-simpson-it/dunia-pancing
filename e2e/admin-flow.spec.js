import { test, expect } from '@playwright/test'
import { loginAsAdmin, clearState } from './helpers'

test.describe('Admin Functionalities', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearState(page)
  })

  test('Admin login works and redirects to dashboard', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/admin(\/|$)/)
  })

  test('Admin dashboard shows product table', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByText('Admin Panel')).toBeVisible()
    await expect(page.getByText(/Produk|Products/).first()).toBeVisible()
    await expect(page.locator('tbody tr').first()).toBeVisible()
    await expect(page.getByPlaceholder(/Cari produk|Search products/)).toBeVisible()
  })

  test('Admin can edit a product inline', async ({ page }) => {
    await loginAsAdmin(page)
    await page.locator('button', { hasText: 'Edit' }).first().click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Simpan').or(page.getByText('Save'))).toBeVisible()
    await expect(page.getByRole('button', { name: /Batal|Cancel/i })).toBeVisible()
    await page.getByRole('button', { name: /Batal|Cancel/i }).click()
    await page.waitForTimeout(200)
    await expect(page.getByText('Edit').first()).toBeVisible()
  })

  test('Admin can delete a product', async ({ page }) => {
    await loginAsAdmin(page)
    const deleteBtns = page.locator('button', { hasText: 'Hapus' })
    if (await deleteBtns.count() > 0) {
      await deleteBtns.first().click()
      await page.waitForTimeout(200)
      await expect(page.locator('button', { hasText: 'Hapus' }).first()).toBeVisible()
      await expect(page.locator('button', { hasText: 'Batal' }).first()).toBeVisible()
      await page.locator('button', { hasText: 'Batal' }).first().click()
    }
  })

  test('Admin Add Product form works', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByText('Tambah Produk').or(page.getByText('Add Product')).click()
    await page.waitForURL('/admin/add')
    await page.waitForTimeout(300)
    await expect(page.getByText(/Tambah Produk|Add Product/).first()).toBeVisible()
    const allInputs = page.locator('form input:not([type="file"])')
    await allInputs.nth(0).fill('Produk Test')
    await allInputs.nth(1).fill('Test Product')
    await allInputs.nth(2).fill('TestBrand')
    await allInputs.nth(3).fill('50000')
    await allInputs.nth(4).fill('75000')
    await allInputs.nth(5).fill('10')
    await allInputs.nth(6).fill('250')
    await page.getByRole('button', { name: /Simpan|Save/ }).click()
    await page.waitForURL('/admin')
  })

  test('Admin category management: add category', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByText('Kategori').first().click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Joran')).toBeVisible()
    await page.getByRole('button', { name: /Tambah|Add/ }).click()
    await page.waitForTimeout(200)
    const inputs = page.locator('form input:not([type="file"])')
    await inputs.nth(0).fill('test_cat')
    await inputs.nth(1).fill('Kategori Test')
    await inputs.nth(2).fill('Test Category')
    await inputs.nth(3).fill('🧪')
    await page.getByRole('button', { name: /Simpan|Save/ }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText('Kategori Test')).toBeVisible()
  })

  test('Admin Revenue page shows stats', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/revenue')
    await expect(page.getByText(/Total Pendapatan|Total Revenue/)).toBeVisible()
    await expect(page.getByText('Rp').first()).toBeVisible()
    await expect(page.getByText(/Produk Terlaris|Top Products/)).toBeVisible()
    await expect(page.getByText(/Pendapatan per Pembayaran|Revenue by Payment/)).toBeVisible()
    await expect(page.getByText(/Pesanan Terbaru|Recent Orders/)).toBeVisible()
  })

  test('Admin Import page shows upload and template download', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByText('Import Harga').or(page.getByText('Price Import')).click()
    await page.waitForURL('/admin/import')
    await page.waitForTimeout(300)
    await expect(page.getByText(/Import Harga|Price Import/).first()).toBeVisible()
    await expect(page.getByText(/Download.*CSV/)).toBeVisible()
    await expect(page.getByText(/Download.*Excel/)).toBeVisible()
    await expect(page.getByText(/Seret file|Drag.*file/)).toBeVisible()
  })

  test('Admin logout works', async ({ page }) => {
    await loginAsAdmin(page)
    await page.getByText(/Keluar|Logout/).click()
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL('/login')
  })
})
