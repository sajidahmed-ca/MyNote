import { test, expect } from '@playwright/test'
import { resetApp, createNote, expectSeeded, goTo } from '../helpers.js'

const pro = () => test.info().project.name === 'note-pro'
const reset = (page) => resetApp(page, { pro: pro() })

// ––– B1: Trash flow (pro) — delete must go to Trash, restore/purge must work –––
test.describe('pro trash flow', () => {
  test('deleting a note moves it to Trash, restore brings it back', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'Trash is a Pro feature')
    await resetApp(page, { pro: true })
    await expectSeeded(page)
    await createNote(page, 'TRASH-ME')
    await page.getByText('TRASH-ME', { exact: true }).click()
    await page.getByTitle('Delete note').click()
    await page.getByTitle('Click again to confirm').click()
    await expect(page.getByText('TRASH-ME', { exact: true })).toHaveCount(0)
    await goTo(page, '/trash')
    await expect(page.getByText('TRASH-ME', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Restore', exact: true }).click()
    await expect(page.getByText('TRASH-ME', { exact: true })).toHaveCount(0)
    await goTo(page, '/')
    await expect(page.getByText('TRASH-ME', { exact: true })).toBeVisible()
  })
})

// ––– B2: custom folders (pro) — persisted across reload, usable in move menus –––
test.describe('pro custom folders', () => {
  test('custom folder survives a reload and shows label', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'Custom folders are a Pro feature')
    await resetApp(page, { pro: true })
    await expectSeeded(page)
    await page.getByTitle('New folder').click()
    await page.getByPlaceholder('Folder name').fill('Research')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await expect(page.getByText('Research', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('Research', { exact: true })).toBeVisible()
  })

  test('custom folder is offered in the editor move menu', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'Custom folders are a Pro feature')
    await resetApp(page, { pro: true })
    await expectSeeded(page)
    await page.getByTitle('New folder').click()
    await page.getByPlaceholder('Folder name').fill('Research')
    await page.keyboard.press('Enter')
    await page.getByText('Atomic Habits', { exact: true }).click()
    await page.getByTitle('Move to folder').click()
    await expect(page.getByRole('menuitem', { name: /Research/ })).toBeVisible()
  })
})

// ––– B3: advertised keyboard shortcuts must actually work –––
test.describe('shared keyboard shortcuts', () => {
  test('Control+K focuses the global search box', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.keyboard.press('Control+k')
    await expect(page.getByPlaceholder('Search notes, tags, authors…')).toBeFocused()
  })

  test('N opens the template launcher from anywhere', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/book-notes')
    await page.keyboard.press('n')
    await expect(page.getByRole('heading', { name: 'New note' })).toBeVisible()
  })
})

// ––– B5: view headings –––
test.describe('journal + tasks headings', () => {
  test('journal page shows its own heading', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/journal')
    await expect(page.getByRole('heading', { name: 'Journal', level: 1 })).toBeVisible()
  })

  test('tasks page shows its own heading', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/tasks')
    await expect(page.getByRole('heading', { name: 'Task lists', level: 1 })).toBeVisible()
  })
})

test.describe('flashcards', () => {
  test('Browse notes when no deck exists returns to All notes', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'flashcards are a pro feature')
    await reset(page)
    await expectSeeded(page)
    await page.getByTitle('Enter selection mode').click()
    await page.getByRole('button', { name: 'Select all visible' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()
    await goTo(page, '/flashcards')
    await expect(page.getByRole('heading', { name: 'No flashcards yet' })).toBeVisible()
    await page.getByRole('button', { name: 'Browse notes' }).click()
    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible()
  })
})

test.describe('dark mode', () => {
  test('dark theme applies to the app shell', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'dark mode is a pro feature')
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/settings')
    await page.getByRole('button', { name: 'Dark' }).click()
    await goTo(page, '/book-notes')
    await expect(page.locator('.theme-dark')).toHaveCSS('background-color', 'rgb(11, 17, 32)')
  })

  test('accent presets drive accent utilities', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'note-pro', 'accent presets are a pro feature')
    await reset(page)
    await expectSeeded(page)
    const newNote = page.getByRole('button', { name: 'New Note' }).first()
    await expect(newNote).toHaveCSS('background-color', 'rgb(99, 102, 241)')
    await goTo(page, '/settings')
    await page.getByRole('button', { name: 'emerald' }).click()
    await expect(newNote).toHaveCSS('background-color', 'rgb(16, 185, 129)')
  })
})

test.describe('accessibility', () => {
  test('editor text scales with the chosen font size', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.goto('/#/settings')
    await page.locator('select', { hasText: 'Medium (15px)' }).selectOption('x-large')
    await page.goto('/#/')
    await page.getByText('Atomic Habits', { exact: true }).click()
    await expect(page.locator('.editor-content').first()).toHaveCSS('font-size', '19px')
  })

  test('high contrast flips the shell canvas to white', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.goto('/#/settings')
    await page
      .getByText('High Contrast', { exact: true })
      .locator('xpath=../..')
      .getByRole('switch')
      .click()
    await expect(page.locator('.a11y-high-contrast')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    )
  })
})

test.describe('note export', () => {
  test('untitled note export filename is sane and downloads', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.getByRole('button', { name: 'New Note' }).click()
    await page.getByRole('button', { name: /Standard note/i }).click()
    await expect(page.getByPlaceholder('Untitled note')).toBeVisible()
    const dl = page.waitForEvent('download')
    await page.getByTitle('Export this note').click()
    const download = await dl
    expect(download.suggestedFilename()).toMatch(/^note-/)
  })
})