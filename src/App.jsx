import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs => {
      setBlogs(blogs)
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
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedUser)
      )

      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      setNotification(null)
    } catch {
      showNotification('wrong username or password')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
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
      blogFormRef.current.toggleVisibility()
      showNotification(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      return true
    } catch {
      showNotification('blog could not be created')
      return false
    }
  }

  const handleLike = async blog => {
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
    } catch {
      showNotification('blog could not be removed')
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>

        <Notification message={notification} />

        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <h2>blogs</h2>

      <Notification message={notification} />

      <p>
        {user.name} logged in{' '}
        <button type="button" onClick={handleLogout}>logout</button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>

      {sortedBlogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={handleLike}
          handleRemove={handleRemove}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default App
