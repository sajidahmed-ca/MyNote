import { test, expect } from '@playwright/test'
import { resetApp } from '../helpers.js'

test('debug hydration stall', async ({ page }) => {
  const logs = []
  page.on('console', (m) => logs.push(`[console:${m.type()}] ${m.text()}`))
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
  await resetApp(page)
  await page.waitForTimeout(8000)
  const body = await page.evaluate(() => document.body.innerText.slice(0, 400))
  console.log('\n==== CAPTURED ====\n' + logs.join('\n') + '\n==== BODY ====\n' + body)
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
})