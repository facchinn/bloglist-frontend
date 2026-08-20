import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('calls createBlog with the correct blog details', async () => {
  const createBlog = vi.fn().mockResolvedValue(true)
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const inputs = screen.getAllByRole('textbox')

  await user.type(inputs[0], 'A test blog')
  await user.type(inputs[1], 'Test Author')
  await user.type(inputs[2], 'https://example.com/test-blog')
  await user.click(screen.getByText('create'))

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'A test blog',
    author: 'Test Author',
    url: 'https://example.com/test-blog',
    likes: 0
  })
})
