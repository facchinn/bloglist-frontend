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

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, testUser.username, 'wrongpassword')
      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'Playwright created blog',
        author: 'Test Author',
        url: 'https://example.com/playwright'
      })

      await expect(page.getByText('Playwright created blog', { exact: false })).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, {
        title: 'Blog to like',
        author: 'Like Author',
        url: 'https://example.com/like'
      })

      const blog = page.locator('.blog').filter({ hasText: 'Blog to like' })
      await blog.getByRole('button', { name: 'view' }).click()
      await blog.getByRole('button', { name: 'like' }).click()

      await expect(blog.getByText('likes 1', { exact: false })).toBeVisible()
    })

    test('the creator can remove a blog', async ({ page }) => {
      await createBlog(page, {
        title: 'Blog to remove',
        author: 'Remove Author',
        url: 'https://example.com/remove'
      })

      const blog = page.locator('.blog').filter({ hasText: 'Blog to remove' })
      await blog.getByRole('button', { name: 'view' }).click()

      page.once('dialog', dialog => dialog.accept())
      await blog.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByText('Blog to remove', { exact: false })).not.toBeVisible()
    })

    test('only the creator sees the remove button', async ({ page, request }) => {
      await createBlog(page, {
        title: 'Creator only blog',
        author: 'Original Author',
        url: 'https://example.com/creator-only'
      })

      await page.getByRole('button', { name: 'logout' }).click()

      await request.post('/api/users', {
        data: {
          username: 'otheruser',
          name: 'Other User',
          password: 'otherpass'
        }
      })

      await loginWith(page, 'otheruser', 'otherpass')

      const blog = page.locator('.blog').filter({ hasText: 'Creator only blog' })
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })

    test('blogs are ordered by likes with the most liked first', async ({ page }) => {
      await createBlog(page, {
        title: 'Few likes',
        author: 'Author One',
        url: 'https://example.com/few'
      })
      await createBlog(page, {
        title: 'Most likes',
        author: 'Author Two',
        url: 'https://example.com/most'
      })
      await createBlog(page, {
        title: 'Middle likes',
        author: 'Author Three',
        url: 'https://example.com/middle'
      })

      const likeBlog = async (title, times) => {
        const blog = page.locator('.blog').filter({ hasText: title })
        await blog.getByRole('button', { name: 'view' }).click()
        for (let i = 0; i < times; i += 1) {
          await blog.getByRole('button', { name: 'like' }).click()
        }
      }

      await likeBlog('Few likes', 1)
      await likeBlog('Most likes', 3)
      await likeBlog('Middle likes', 2)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Most likes')
      await expect(blogs.nth(1)).toContainText('Middle likes')
      await expect(blogs.nth(2)).toContainText('Few likes')
    })
  })
})
