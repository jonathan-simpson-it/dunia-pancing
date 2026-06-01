import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('Admin Chat', () => {

  test('conversations list loads', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })
    await expect(page.locator('h2:has-text("Percakapan")')).toBeVisible({ timeout: 10000 })
  })

  test('select conversation and view messages', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })

    const firstBtn = page.locator('button.w-full.text-left').first()
    await firstBtn.waitFor({ state: 'visible', timeout: 15000 })
    await firstBtn.click()

    await expect(page.locator('.flex-1.overflow-y-auto.p-4')).toBeVisible({ timeout: 10000 })
  })

  test('send a reply', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })

    const firstBtn = page.locator('button.w-full.text-left').first()
    await firstBtn.waitFor({ state: 'visible', timeout: 15000 })
    await firstBtn.click()

    const input = page.locator('input[placeholder="Ketik balasan..."]')
    await input.waitFor({ state: 'visible', timeout: 10000 })

    const unique = `Test ${Date.now()}`
    await input.fill(unique)

    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/chat/conversations/') && r.request().method() === 'POST'),
      input.press('Enter'),
    ])

    await expect(page.locator(`text=${unique}`)).toBeVisible({ timeout: 10000 })
  })

  test('scroll does not jump on idle polls', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })

    const firstBtn = page.locator('button.w-full.text-left').first()
    await firstBtn.waitFor({ state: 'visible', timeout: 15000 })
    await firstBtn.click()

    const container = page.locator('.flex-1.overflow-y-auto.p-4')
    await container.waitFor({ state: 'visible', timeout: 5000 })

    // Wait for messages to fully render and settle
    await page.waitForTimeout(2000)
    const scrollBefore = await container.evaluate(el => el.scrollTop)

    // Wait through two 3-second poll cycles
    await page.waitForTimeout(7000)
    const scrollAfter = await container.evaluate(el => el.scrollTop)

    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(200)
  })
})
