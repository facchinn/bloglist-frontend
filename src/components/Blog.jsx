import { useState } from 'react'

const Blog = ({ blog, handleLike, handleRemove, currentUser }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const detailsStyle = { display: visible ? '' : 'none' }
  const buttonLabel = visible ? 'hide' : 'view'
  const canRemove = blog.user && blog.user.username === currentUser?.username

  return (
    <div className="blog" style={blogStyle}>
      <div>
        {blog.title} {blog.author}{' '}
        <button type="button" onClick={() => setVisible(!visible)}>
          {buttonLabel}
        </button>
      </div>

      <div className="blogDetails" style={detailsStyle}>
        <div>{blog.url}</div>
        <div>
          likes {blog.likes}{' '}
          <button type="button" onClick={() => handleLike(blog)}>like</button>
        </div>
        <div>{blog.user?.name}</div>
        {canRemove && (
          <button type="button" onClick={() => handleRemove(blog)}>remove</button>
        )}
      </div>
    </div>
  )
}

export default Blog
