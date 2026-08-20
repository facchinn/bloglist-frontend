import styled from 'styled-components'

const Message = styled.div`
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1px solid #888888;
  border-radius: 7px;
  background: #f4f4f4;
  font-weight: 600;
`

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return <Message>{message}</Message>
}

export default Notification
