import React from 'react'
import { Button, Typography } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { useAuth } from 'context/auth'

const { Text, Paragraph } = Typography

export const NoRole = () => {
  const { logout, isLoggingOut, userId } = useAuth()

  return (
    <>
      <Paragraph>
        Hello <Text strong>{userId}</Text>, your user has not a role assigned to access this app.
      </Paragraph>
      <Paragraph>Please contact an administrator.</Paragraph>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Button icon={<LogoutOutlined />} type='primary' loading={isLoggingOut} onClick={() => logout()}>
          Logout
        </Button>
      </div>
    </>
  )
}
