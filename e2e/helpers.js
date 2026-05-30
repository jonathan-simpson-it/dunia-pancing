import { expect } from '@playwright/test'

export async function loginAsAdmin(page) {
  await page.goto('/login')
  await page.getByRole('button', { name: /admin/i }).click()
  await page.getByPlaceholder('admin').fill('admin')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/admin/)
}

export async function loginAsClient(page, phone = '08123456789') {
  await page.goto('/login')
  await page.getByRole('button', { name: /pelanggan|client/i }).click()
  await page.getByRole('button', { name: /masuk|sign in/i }).click()
  await page.getByPlaceholder('08123456789').fill(phone)
  await page.locator('input[type="password"]').fill('test123')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(/\/(?!login)/)
}

export async function clearState(page) {
  await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('dunia-pancing-'))
    keys.forEach(k => localStorage.removeItem(k))
  })
}
