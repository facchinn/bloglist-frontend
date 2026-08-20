import { render, screen } from '@testing-library/react'
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

const renderBlog = currentUser => {
  render(
    <Blog
      blog={blog}
      handleLike={() => {}}
      handleRemove={() => {}}
      currentUser={currentUser}
    />
  )
}

test('unauthenticated user sees blog information and likes but no buttons', () => {
  renderBlog(null)

  expect(screen.getByText('Testing React components Test Author')).toBeVisible()
  expect(screen.getByText('https://example.com/testing')).toBeVisible()
  expect(screen.getByText('likes 5')).toBeVisible()
  expect(screen.queryByRole('button', { name: 'like' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
})

test('logged in user who is not creator sees only like button', () => {
  renderBlog({ username: 'otheruser', name: 'Other User' })

  expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
})

test('blog creator sees like and remove buttons', () => {
  renderBlog({ username: 'testuser', name: 'Test User' })

  expect(screen.getByRole('button', { name: 'like' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'remove' })).toBeVisible()
})
