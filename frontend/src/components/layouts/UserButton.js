import React from 'react'
import { Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'

import { useUserDrawer } from 'context'

export const UserButton = () => {
  const { open } = useUserDrawer()

  return <Button onClick={() => open()} type='primary' icon={<UserOutlined />} />
}
