import { test, expect } from '@playwright/test'
import { resetApp } from '../helpers.js'

test('debug pro activation', async ({ page }) => {
  const logs = []
  page.on('console', (m) => logs.push(`[console:${m.type()}] ${m.text()}`))
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
  await resetApp(page, { pro: true })
  await page.waitForTimeout(6000)
  const state = await page.evaluate(() => ({
    path: location.pathname + location.hash,
    ls: { ...localStorage },
  }))
  const body = await page.evaluate(() => document.body.innerText.slice(0, 300))
  console.log('\n==== STATE ====\n' + JSON.stringify(state, null, 2))
  console.log('==== LOGS ====\n' + logs.join('\n'))
  console.log('==== BODY ====\n' + body)
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
})