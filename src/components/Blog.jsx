import styled from 'styled-components'

const Card = styled.div`
  padding: 24px;
  border: 1px solid #dddddd;
  border-radius: 10px;
  background: #fafafa;
`

const Title = styled.h2`
  margin-top: 0;
`

const Url = styled.a`
  display: inline-block;
  margin-bottom: 14px;
`

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin: 14px 0;
`

const Button = styled.button`
  padding: 7px 12px;
  border: 1px solid #999999;
  border-radius: 5px;
  cursor: pointer;
`

const RemoveButton = styled(Button)`
  border-color: #b00020;
`

const Blog = ({ blog, handleLike, handleRemove, currentUser }) => {
  const canRemove = Boolean(
    currentUser &&
    blog.user &&
    blog.user.username === currentUser.username
  )

  return (
    <Card className="blogDetails">
      <Title>{blog.title} {blog.author}</Title>
      <Url href={blog.url}>{blog.url}</Url>
      <div>likes {blog.likes}</div>
      <div>added by {blog.user?.name || 'unknown'}</div>

      {currentUser && (
        <Actions>
          <Button type="button" onClick={() => handleLike(blog)}>like</Button>
          {canRemove && (
            <RemoveButton type="button" onClick={() => handleRemove(blog)}>
              remove
            </RemoveButton>
          )}
        </Actions>
      )}
    </Card>
  )
}

export default Blog
