import { test, expect } from '@playwright/test'
import { resetApp, createNote, expectSeeded, goTo } from '../helpers.js'

const pro = () => test.info().project.name === 'note-pro'
const reset = (page) => resetApp(page, { pro: pro() })

// Routes for the hash router
const ROUTES = [
  ['/', 'All notes'],
  ['/book-notes', 'Book notes'],
  ['/flashcards', 'Flashcards'],
  ['/pinned', 'Pinned notes'],
  ['/settings', 'Settings'],
]

test.describe('routing + seeded content', () => {
  for (const [route, heading] of ROUTES) {
    test(`${route} renders`, async ({ page }) => {
      await reset(page)
      await expectSeeded(page)
      await goTo(page, route)
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    })
  }

  test('folder route shows folder label', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/folder/study')
    await expect(page.getByRole('heading', { name: 'Study', level: 1 })).toBeVisible()
  })

  test('tag route shows tag heading', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/tags/reading')
    await expect(page.getByRole('heading', { name: '#reading', level: 1 })).toBeVisible()
  })
})

test.describe('notes CRUD', () => {
  test('create and edit a note', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await createNote(page, 'E2E Smoke Note')
    await expect(page.getByText('E2E Smoke Note', { exact: true })).toBeVisible()
  })

  test('search filters notes by title', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.getByPlaceholder('Search notes, tags, authors…').fill('atomic')
    await expect(page.getByText('Atomic Habits', { exact: true })).toBeVisible()
    await expect(page.getByText('Git Workflow Cheatsheet')).toHaveCount(0)
  })

  test('grid <-> list view toggle persists list rows', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.getByTitle('List view').click()
    await expect(page.getByText('Atomic Habits', { exact: true })).toBeVisible()
    await page.getByTitle('Grid view').click()
    await expect(page.locator('article').first()).toBeVisible()
  })
})

test.describe('selection flows', () => {
  test('bulk select then delete works', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await page.getByTitle('Enter selection mode').click()
    await page.locator('article').first().click()
    await expect(page.getByText('1 selected')).toBeVisible()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Confirm delete' }).click()
    await expect(page.getByText('1 selected')).toHaveCount(0)
  })
})

test.describe('flashcards', () => {
  test('study deck flips and navigates', async ({ page }) => {
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/flashcards')
    await page.getByRole('button', { name: 'Study deck' }).click()
    await expect(page.getByRole('heading', { name: 'Study mode', level: 1 })).toBeVisible()
    await page.locator('button[style*="preserve-3d"]').click()
    await expect(page.getByText('back', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Exit deck' }).click()
    await expect(page.getByRole('heading', { name: 'Flashcards', level: 1 })).toBeVisible()
  })
})

test.describe('upgrade page (free)', () => {
  test('upgrade page renders feature grid', async ({ page }) => {
    test.skip(pro(), 'Pro edition shows the dashboard, not the upgrade pitch')
    await reset(page)
    await expectSeeded(page)
    await goTo(page, '/upgrade')
    await expect(page.getByRole('heading', { name: /Upgrade to/ })).toBeVisible()
  })
})