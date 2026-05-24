import { test, expect } from '@playwright/test'

test.describe('Admin Functionalities', () => {

  async function adminLogin(page) {
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
  }

  test('Admin login works and redirects to dashboard', async ({ page }) => {
    await adminLogin(page)
    await expect(page).toHaveURL('/admin')
  })

  test('Admin dashboard shows product table', async ({ page }) => {
    await adminLogin(page)

    await expect(page.getByText('Admin Panel')).toBeVisible()
    await expect(page.getByText(/Produk|Products/).first()).toBeVisible()
    await expect(page.locator('tbody tr').first()).toBeVisible()
    await expect(page.getByPlaceholder(/Cari produk|Search products/)).toBeVisible()
  })

  test('Admin can edit a product inline', async ({ page }) => {
    await adminLogin(page)

    await page.locator('button', { hasText: 'Edit' }).first().click()
    await page.waitForTimeout(300)

    await expect(page.getByText('Simpan').or(page.getByText('Save'))).toBeVisible()
    await expect(page.getByText('Batal').or(page.getByText('Cancel'))).toBeVisible()

    await page.getByText('Batal').or(page.getByText('Cancel')).click()
    await page.waitForTimeout(200)

    await expect(page.getByText('Edit').first()).toBeVisible()
  })

  test('Admin can delete a product', async ({ page }) => {
    await adminLogin(page)

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
    await adminLogin(page)

    // Navigate to Add Product via sidebar link
    await page.getByText('Tambah Produk').or(page.getByText('Add Product')).click()
    await page.waitForURL('/admin/add')
    await page.waitForTimeout(300)

    await expect(page.getByText(/Tambah Produk|Add Product/).first()).toBeVisible()

    // Fill form fields in order they appear
    const allInputs = page.locator('form input:not([type="file"])')

    await allInputs.nth(0).fill('Produk Test')       // name_id
    await allInputs.nth(1).fill('Test Product')       // name_en
    await allInputs.nth(2).fill('TestBrand')           // brand
    await allInputs.nth(3).fill('50000')               // price_idr
    await allInputs.nth(4).fill('75000')               // original_price_idr
    await allInputs.nth(5).fill('10')                  // stock_qty
    await allInputs.nth(6).fill('250')                 // weight

    // Submit form
    await page.getByRole('button', { name: /Simpan|Save/ }).click()
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL('/admin')
  })

  test('Admin category management: add category', async ({ page }) => {
    await adminLogin(page)

    await page.getByText('Kategori').first().click()
    await page.waitForTimeout(300)

    await expect(page.getByText('Joran')).toBeVisible()

    // Click Add button
    await page.getByRole('button', { name: /Tambah|Add/ }).click()
    await page.waitForTimeout(200)

    // Fill category form by nth inputs
    const inputs = page.locator('form input:not([type="file"])')
    await inputs.nth(0).fill('test_cat')      // key
    await inputs.nth(1).fill('Kategori Test') // name_id
    await inputs.nth(2).fill('Test Category') // name_en
    await inputs.nth(3).fill('🧪')             // icon

    await page.getByRole('button', { name: /Simpan|Save/ }).click()
    await page.waitForTimeout(300)

    await expect(page.getByText('Kategori Test')).toBeVisible()
  })

  test('Admin Revenue page shows stats', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const orders = [{
        id: 'DP-240524-001',
        date: new Date().toISOString(),
        status: 'waiting_payment',
        items: [{ id: 'dp-002', name_id: 'Joran Test', name_en: 'Test Rod', image: '', price_idr: 50000, qty: 2 }],
        customer: { name: 'Test', phone: '08123', address: 'Jl. Test', city: 'Palembang' },
        shipping: { id: 'jne_reg', label: 'JNE Regular', fee: 15000 },
        payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA', accountNumber: '123' },
        subtotal: 100000,
        shipping_fee: 15000,
        total: 115000,
      }]
      localStorage.setItem('dunia-pancing-orders', JSON.stringify(orders))
      localStorage.setItem('dunia-pancing-session', JSON.stringify({ username: 'admin', role: 'admin', name: 'Admin' }))
      localStorage.setItem('dunia-pancing-users', JSON.stringify([{ username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }]))
    })
    await page.reload()
    await page.waitForTimeout(500)

    await page.goto('/admin/revenue')
    await page.waitForTimeout(500)

    await expect(page.getByText(/Total Pendapatan|Total Revenue/)).toBeVisible()
    await expect(page.getByText('Rp').first()).toBeVisible()
    await expect(page.getByText(/Produk Terlaris|Top Products/)).toBeVisible()
    await expect(page.getByText(/Pendapatan per Pembayaran|Revenue by Payment/)).toBeVisible()
    await expect(page.getByText(/Pesanan Terbaru|Recent Orders/)).toBeVisible()
    await expect(page.getByText('DP-240524-001')).toBeVisible()
  })

  test('Admin Import page shows upload and template download', async ({ page }) => {
    await adminLogin(page)

    await page.getByText('Import Harga').or(page.getByText('Price Import')).click()
    await page.waitForURL('/admin/import')
    await page.waitForTimeout(300)

    await expect(page.getByText(/Import Harga|Price Import/).first()).toBeVisible()
    await expect(page.getByText(/Download.*CSV/)).toBeVisible()
    await expect(page.getByText(/Download.*Excel/)).toBeVisible()
    await expect(page.getByText(/Seret file|Drag.*file/)).toBeVisible()
  })

  test('Admin logout works', async ({ page }) => {
    await adminLogin(page)

    await page.getByText(/Keluar|Logout/).click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL('/login')
  })
})
