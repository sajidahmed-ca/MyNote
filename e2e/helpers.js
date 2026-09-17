import { test, expect } from '@playwright/test'

export const LICENSE_KEY =
  'v1.5018a557-8fad-44f7-b673-d03087240468.eyJpZCI6ImNiZDMzZTNlLTYyMGYtNDZmYS04NDAyLTI3MjA5NTA3ZDU1MCIsIm5hbWUiOiJTYWppZCBLYXJpbSIsImVtYWlsIjoic2FqaWRAZXhhbXBsZS5jb20iLCJwbGFuIjoicHJvIiwiaXNzdWVkQXQiOjE3ODk1NTMzOTY2OTMsImV4cGlyZXNBdCI6MTgyMTA4OTM5NjY5M30.jTfmYQzZE4DMTCpA4iHv22CM95KKpoiMIQeWnGAO6W8Gundby7SXv8uqgP_1GMZUHIf5C4HaXGpVVzp3ZuJ5DQ'

export async function resetApp(page, { pro = false } = {}) {
  await page.goto('/')
  // Each Playwright test already gets an isolated storage context
  // (fresh IndexedDB + localStorage), so seeding starts clean every test.
  await page.waitForLoadState('domcontentloaded')
  if (pro) await activatePro(page)
}

async function activatePro(page) {
  const btn = page.getByRole('button', { name: 'Activate Pro' })
  await btn.waitFor({ state: 'visible', timeout: 15_000 })
  await page.getByPlaceholder(/xxxxxxxxxxxx/).fill(LICENSE_KEY)
  await btn.click()
  await expect(page.getByText('All notes', { exact: true }).first()).toBeVisible({
    timeout: 15_000,
  })
}

export async function expectSeeded(page) {
  // Wait for hydration to finish (Splash -> seeded notes)
  await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
}

export async function createNote(page, title) {
  await page.getByRole('button', { name: 'New Note' }).click()
  await page.getByRole('button', { name: /Standard note/i }).click()
  const editor = page.getByPlaceholder('Untitled note')
  await expect(editor).toBeVisible({ timeout: 10_000 })
  await editor.fill(title)
  const body = page.locator('[contenteditable="true"]').first()
  await body.click()
  await page.keyboard.type('Hello from e2e smoke test.')
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByText(title, { exact: true })).toBeVisible()
}