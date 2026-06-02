import { test, expect } from '@playwright/test'
import { loginAsAdmin, clearState } from './helpers'

test.describe('Admin Chat', () => {

  test('conversations list loads', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })
    await expect(page.locator('h2:has-text("Percakapan")')).toBeVisible({ timeout: 10000 })
  })

  test('select conversation and view messages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    const chatBtn = page.locator('button').filter({ hasText: /Chat/i })
    if (await chatBtn.isVisible()) {
      await chatBtn.click()
      await page.waitForTimeout(500)
      const input = page.locator('textarea, input[type="text"]').filter({ has: page.locator('[placeholder*="Ketik"]') }).first()
      if (await input.isVisible()) {
        await input.fill('Halo, ada promo?')
        await input.press('Enter')
        await page.waitForTimeout(1000)
      }
    }

    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const conversations = page.locator('button.w-full.text-left')
    const count = await conversations.count()
    if (count > 0) {
      await conversations.first().click()
      await expect(page.locator('.flex-1.overflow-y-auto.p-4')).toBeVisible({ timeout: 10000 })
    }
  })

  test('send a reply', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    const chatBtn = page.locator('button').filter({ hasText: /Chat/i })
    if (await chatBtn.isVisible()) {
      await chatBtn.click()
      await page.waitForTimeout(500)
      const input = page.locator('textarea, input[type="text"]').filter({ has: page.locator('[placeholder*="Ketik"]') }).first()
      if (await input.isVisible()) {
        await input.fill('Test message from customer')
        await input.press('Enter')
        await page.waitForTimeout(1000)
      }
    }

    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const count = await page.locator('button.w-full.text-left').count()
    if (count === 0) return

    await page.locator('button.w-full.text-left').first().click()

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
    await page.goto('/')
    await page.waitForLoadState('load')
    const chatBtn = page.locator('button').filter({ hasText: /Chat/i })
    if (await chatBtn.isVisible()) {
      await chatBtn.click()
      await page.waitForTimeout(500)
      const input = page.locator('textarea, input[type="text"]').filter({ has: page.locator('[placeholder*="Ketik"]') }).first()
      if (await input.isVisible()) {
        await input.fill('Scroll test message')
        await input.press('Enter')
        await page.waitForTimeout(1000)
      }
    }

    await loginAsAdmin(page)
    await page.goto('/admin/chat', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const count = await page.locator('button.w-full.text-left').count()
    if (count === 0) return

    await page.locator('button.w-full.text-left').first().click()

    const container = page.locator('.flex-1.overflow-y-auto.p-4')
    await container.waitFor({ state: 'visible', timeout: 5000 })

    await page.waitForTimeout(2000)
    const scrollBefore = await container.evaluate(el => el.scrollTop)

    await page.waitForTimeout(7000)
    const scrollAfter = await container.evaluate(el => el.scrollTop)

    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(200)
  })
})
