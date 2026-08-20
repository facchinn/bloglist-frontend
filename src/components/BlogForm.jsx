import { useState } from 'react'
import styled from 'styled-components'

const Form = styled.form`
  max-width: 480px;
  display: grid;
  gap: 12px;
`

const Field = styled.label`
  display: grid;
  gap: 4px;
  font-weight: 600;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #bbbbbb;
  border-radius: 5px;
`

const Button = styled.button`
  width: fit-content;
  padding: 8px 14px;
  border: 1px solid #888888;
  border-radius: 5px;
  cursor: pointer;
`

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = async event => {
    event.preventDefault()

    const created = await createBlog({
      title,
      author,
      url,
      likes: 0
    })

    if (created) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <div>
      <h2>create new</h2>
      <Form onSubmit={addBlog}>
        <Field>
          title
          <Input
            name="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </Field>
        <Field>
          author
          <Input
            name="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </Field>
        <Field>
          url
          <Input
            name="url"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          />
        </Field>
        <Button type="submit">create</Button>
      </Form>
    </div>
  )
}

export default BlogForm
