const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

const testUser = {
  username: 'testuser',
  name: 'Test User',
  password: 'secret123'
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', { data: testUser })
    await page.goto('/')
  })

  test('login succeeds with correct credentials', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)
    await expect(page.getByText('Test User logged in')).toBeVisible()
    await expect(page).toHaveURL(/\/$/)
  })

  test('login fails with wrong credentials', async ({ page }) => {
    await loginWith(page, testUser.username, 'wrongpassword')
    await expect(page.getByText('wrong username or password')).toBeVisible()
    await expect(page.getByText('Test User logged in')).not.toBeVisible()
  })

  test('a logged in user can create a blog', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)
    await createBlog(page, {
      title: 'Playwright created blog',
      author: 'Test Author',
      url: 'https://example.com/playwright'
    })

    await expect(page.locator('.blog').filter({ hasText: 'Playwright created blog' })).toBeVisible()
    await expect(page).toHaveURL(/\/$/)
  })

  test('a logged in user can like a blog', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)
    await createBlog(page, {
      title: 'Blog to like',
      author: 'Like Author',
      url: 'https://example.com/like'
    })

    await page.getByRole('link', { name: /Blog to like/ }).click()
    await expect(page.getByText('likes 0')).toBeVisible()
    await page.getByRole('button', { name: 'like' }).click()
    await expect(page.getByText('likes 1')).toBeVisible()
  })

  test('a logged in user can delete a blog', async ({ page }) => {
    await loginWith(page, testUser.username, testUser.password)
    await createBlog(page, {
      title: 'Blog to remove',
      author: 'Remove Author',
      url: 'https://example.com/remove'
    })

    await page.getByRole('link', { name: /Blog to remove/ }).click()
    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'remove' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('link', { name: /Blog to remove/ })).toHaveCount(0)
  })
})
