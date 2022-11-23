import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

import { CustomSider, UserDrawer } from 'components'

const { Content } = Layout

export const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <CustomSider />
      <Layout style={{ marginLeft: 80 }}>
        <Content>
          <Outlet />
        </Content>
        <UserDrawer />
      </Layout>
    </Layout>
  )
}
