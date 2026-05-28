import { test, expect } from '@playwright/test'

test.describe('Account & Auth Edge Cases', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dunia-pancing-'))
      keys.forEach(k => localStorage.removeItem(k))
    })
    await page.reload()
  })

  test('Logged-out user accessing /account is redirected', async ({ page }) => {
    await page.goto('/account')
    await page.waitForTimeout(1000)
    expect(page.url()).not.toContain('/account')
  })

  test('Empty cart page shows empty state message', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText(/keranjang.*kosong|your cart is empty/i)).toBeVisible()
    const ctaLink = page.getByRole('link', { name: /Belanja|Shop Now|Jelajah|Browse/ })
    await expect(ctaLink).toBeVisible()
  })

  test('Logged-out user accessing /admin is redirected', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/login')
  })

  test('Admin with wrong credentials sees error', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('admin').fill('admin')
    await page.getByPlaceholder('••••••').fill('wrongpassword')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText(/Username atau password salah|Invalid username or password/)).toBeVisible()
  })

  test('Customer login with unregistered phone shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.getByPlaceholder('08123456789').fill('081234567899')
    await page.getByPlaceholder('••••••').fill('somepass')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText(/Akun tidak ditemukan|Account not found/)).toBeVisible()
  })

  test('Registration with mismatched passwords shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.getByRole('button', { name: /Daftar|Sign Up/ }).first().click()
    await page.getByPlaceholder('Budi Santoso').fill('Test User')
    await page.getByPlaceholder('08123456789').fill('081234567888')
    await page.getByPlaceholder(/Min/i).fill('password1')
    await page.getByPlaceholder(/Ulangi|Repeat/i).fill('password2')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText(/Password tidak cocok|Passwords do not match/)).toBeVisible()
  })

  test('Registration with duplicate phone shows error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.getByRole('button', { name: /Daftar|Sign Up/ }).first().click()
    await page.getByPlaceholder('Budi Santoso').fill('First User')
    await page.getByPlaceholder('08123456789').fill('081234560000')
    await page.getByPlaceholder(/Min/i).fill('password123')
    await page.getByPlaceholder(/Ulangi|Repeat/i).fill('password123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/^(?!.*login)/)
    await page.evaluate(() => {
      localStorage.removeItem('dunia-pancing-session')
    })
    await page.goto('/login')
    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.getByRole('button', { name: /Daftar|Sign Up/ }).first().click()
    await page.getByPlaceholder('Budi Santoso').fill('Duplicate User')
    await page.getByPlaceholder('08123456789').fill('081234560000')
    await page.getByPlaceholder(/Min/i).fill('password456')
    await page.getByPlaceholder(/Ulangi|Repeat/i).fill('password456')
    await page.locator('form button[type="submit"]').click()
    await expect(page.getByText(/No. HP sudah terdaftar|Phone number already registered/)).toBeVisible()
  })

  test('Customer account page shows profile info', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Pelanggan|Customer/ }).click()
    await page.getByRole('button', { name: /Daftar|Sign Up/ }).first().click()
    await page.getByPlaceholder('Budi Santoso').fill('Profile Test')
    await page.getByPlaceholder('08123456789').fill('081234569999')
    await page.getByPlaceholder(/Min/i).fill('testpass123')
    await page.getByPlaceholder(/Ulangi|Repeat/i).fill('testpass123')
    await page.locator('form button[type="submit"]').click()
    await page.waitForURL(/^(?!.*login)/)
    await page.goto('/account')
    await expect(page.getByText(/Profile Test/).first()).toBeVisible()
    await expect(page.getByText(/081234569999/)).toBeVisible()
  })

  test('Customer account shows order history after placing order', async ({ page }) => {
    const orderId = 'DP-311224-001'
    await page.evaluate((id) => {
      localStorage.setItem('dunia-pancing-orders', JSON.stringify([{
        id,
        date: new Date().toISOString(),
        status: 'waiting_payment',
        items: [{ id: 'dp-002', name_id: 'Joran Test', name_en: 'Rod Test', image: '', price_idr: 150000, qty: 2 }],
        customer: { name: 'History User', phone: '081234561111', address: 'Jl. Test', city: 'Palembang' },
        shipping: { id: 'jne_reg', label: 'JNE Reguler', fee: 15000 },
        payment: { id: 'bca', label: 'Transfer BCA', method: 'bank_transfer', bank: 'BCA', accountNumber: '123456' },
        subtotal: 300000,
        shipping_fee: 15000,
        total: 315000,
        statusHistory: [{ status: 'waiting_payment', timestamp: new Date().toISOString() }],
      }]))
      localStorage.setItem('dunia-pancing-users', JSON.stringify([
        { username: '081234561111', password: 'testpass', role: 'client', name: 'History User', phone: '081234561111' },
      ]))
      localStorage.setItem('dunia-pancing-session', JSON.stringify({
        username: '081234561111', role: 'client', name: 'History User',
      }))
    }, orderId)
    await page.goto('/account')
    await expect(page.getByText(/Riwayat Pesanan|Order History/)).toBeVisible()
    await expect(page.getByText(orderId)).toBeVisible()
    await expect(page.getByText(/Menunggu Pembayaran|Waiting Payment/)).toBeVisible()
    await expect(page.getByText(/315.000|315,000/)).toBeVisible()
  })

  test('Unpaid order transitions after checkout', async ({ page }) => {
    await page.goto('/product/dp-002')
    await page.getByRole('button', { name: /Beli|Buy Now/ }).click()
    await page.waitForURL('/cart')
    await page.getByRole('button', { name: /Checkout/i }).click()
    await page.waitForURL('/checkout')
    await page.getByPlaceholder('Budi Santoso').fill('Order User')
    await page.getByPlaceholder('08123456789').fill('081234562222')
    await page.getByPlaceholder(/Jl\./).fill('Jl. Merdeka No. 1')
    await page.getByPlaceholder('Palembang').fill('Palembang')
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/ }).click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/order-success\/DP-/)
  })

  test('Cashier walk-in payment flow shows store payment info', async ({ page }) => {
    await page.goto('/product/dp-002')
    await page.getByRole('button', { name: /Beli|Buy Now/ }).click()
    await page.waitForURL('/cart')
    await page.getByRole('button', { name: /Checkout/i }).click()
    await page.waitForURL('/checkout')
    await page.getByPlaceholder('Budi Santoso').fill('Walk-in User')
    await page.getByPlaceholder('08123456789').fill('081234563333')
    await page.getByPlaceholder(/Jl\./).fill('Jl. Store')
    await page.getByPlaceholder('Palembang').fill('Palembang')
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByText(/Bayar di Toko|Pay at Store/).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Lanjut|Continue/ }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Konfirmasi Pesanan|Confirm Order/ }).click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/order-success\/DP-/)
    await expect(page.getByText(/Bayar di Toko|Pay at Store/).first()).toBeVisible()
  })
})
