import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  id: '123',
  title: 'Testing React components',
  author: 'Test Author',
  url: 'https://example.com/testing',
  likes: 5,
  user: {
    id: 'user123',
    username: 'testuser',
    name: 'Test User'
  }
}

test('shows title and author but hides url and likes by default', () => {
  render(
    <Blog
      blog={blog}
      handleLike={() => {}}
      handleRemove={() => {}}
      currentUser={blog.user}
    />
  )

  const blogElement = screen.getByText('Testing React components Test Author', { exact: false })
  expect(blogElement).toBeVisible()

  const urlElement = screen.getByText('https://example.com/testing')
  const likesElement = screen.getByText('likes 5', { exact: false })

  expect(urlElement).not.toBeVisible()
  expect(likesElement).not.toBeVisible()
})

test('shows url and likes after clicking view', async () => {
  const user = userEvent.setup()

  render(
    <Blog
      blog={blog}
      handleLike={() => {}}
      handleRemove={() => {}}
      currentUser={blog.user}
    />
  )

  await user.click(screen.getByText('view'))

  expect(screen.getByText('https://example.com/testing')).toBeVisible()
  expect(screen.getByText('likes 5', { exact: false })).toBeVisible()
})

test('clicking like twice calls handler twice', async () => {
  const user = userEvent.setup()
  const handleLike = vi.fn()

  render(
    <Blog
      blog={blog}
      handleLike={handleLike}
      handleRemove={() => {}}
      currentUser={blog.user}
    />
  )

  await user.click(screen.getByText('view'))
  const likeButton = screen.getByText('like')

  await user.click(likeButton)
  await user.click(likeButton)

  expect(handleLike.mock.calls).toHaveLength(2)
})
