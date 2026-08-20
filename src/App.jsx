import { useState, useEffect } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  font-family: Arial, sans-serif;
`

const Navigation = styled.nav`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 24px;
  background: #eeeeee;
  border-radius: 8px;
`

const NavLink = styled(Link)`
  color: #222222;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Button = styled.button`
  padding: 7px 12px;
  border: 1px solid #999999;
  border-radius: 5px;
  cursor: pointer;
`

const StyledForm = styled.form`
  max-width: 420px;
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

const LoginForm = ({ username, password, setUsername, setPassword, handleLogin }) => (
  <div>
    <h2>Log in to application</h2>
    <StyledForm onSubmit={handleLogin}>
      <Field>
        username
        <Input
          name="username"
          type="text"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </Field>
      <Field>
        password
        <Input
          name="password"
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </Field>
      <Button type="submit">login</Button>
    </StyledForm>
  </div>
)

const BlogList = ({ blogs }) => (
  <div>
    <h2>blogs</h2>
    {blogs.map(blog => (
      <div className="blog" key={blog.id}>
        <NavLink to={`/blogs/${blog.id}`}>{blog.title} {blog.author}</NavLink>
      </div>
    ))}
  </div>
)

const BlogRoute = ({ blogs, user, handleLike, handleRemove }) => {
  const { id } = useParams()
  const blog = blogs.find(item => item.id === id)

  if (!blog) {
    return <div>blog not found</div>
  }

  return (
    <Blog
      blog={blog}
      currentUser={user}
      handleLike={handleLike}
      handleRemove={handleRemove}
    />
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    blogService.getAll().then(data => {
      setBlogs(data)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')

    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const showNotification = message => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      setNotification(null)
      navigate('/')
    } catch {
      showNotification('wrong username or password')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
    navigate('/')
  }

  const createBlog = async blogObject => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      const createdBlog = {
        ...returnedBlog,
        user: {
          id: typeof returnedBlog.user === 'string'
            ? returnedBlog.user
            : returnedBlog.user?.id,
          username: user.username,
          name: user.name
        }
      }

      setBlogs(blogs.concat(createdBlog))
      showNotification(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      navigate('/')
      return true
    } catch {
      showNotification('blog could not be created')
      return false
    }
  }

  const handleLike = async blog => {
    if (!user) return

    const userId = typeof blog.user === 'object' ? blog.user?.id : blog.user
    const blogToUpdate = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: userId
    }

    try {
      const returnedBlog = await blogService.update(blog.id, blogToUpdate)
      setBlogs(blogs.map(currentBlog =>
        currentBlog.id === blog.id
          ? { ...returnedBlog, user: blog.user }
          : currentBlog
      ))
    } catch {
      showNotification('blog could not be liked')
    }
  }

  const handleRemove = async blog => {
    const confirmed = window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)
    if (!confirmed) return

    try {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(currentBlog => currentBlog.id !== blog.id))
      navigate('/')
    } catch {
      showNotification('blog could not be removed')
    }
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <Page>
      <Navigation>
        <NavLink to="/">blogs</NavLink>
        {user && <NavLink to="/create">new blog</NavLink>}
        {!user && <NavLink to="/login">login</NavLink>}
        {user && (
          <>
            <span>{user.name} logged in</span>
            <Button type="button" onClick={handleLogout}>logout</Button>
          </>
        )}
      </Navigation>

      <Notification message={notification} />

      <Routes>
        <Route path="/" element={<BlogList blogs={sortedBlogs} />} />
        <Route
          path="/login"
          element={user
            ? <Navigate to="/" replace />
            : (
              <LoginForm
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                handleLogin={handleLogin}
              />
            )}
        />
        <Route
          path="/create"
          element={user
            ? <BlogForm createBlog={createBlog} />
            : <Navigate to="/login" replace />}
        />
        <Route
          path="/blogs/:id"
          element={(
            <BlogRoute
              blogs={blogs}
              user={user}
              handleLike={handleLike}
              handleRemove={handleRemove}
            />
          )}
        />
      </Routes>
    </Page>
  )
}

export default App
