import React from 'react'
import { Layout, Grid, Card, Drawer, Button } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

import { CustomFooter } from 'components'

import logo from 'images/logo.png'

const { Content } = Layout
const { useBreakpoint } = Grid

const titles = {
  '/login': 'Login',
  '/login/set-password': 'Set password',
  '/login/forgot-password': 'Reset password',
  '/no-role': 'No role assigned'
}

export const LoginLayout = () => {
  const breakpoints = useBreakpoint()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <div
        style={{
          position: 'fixed',
          minWidth: '100vh',
          width: '100%',
          height: '100%',
          zIndex: 0,
          display: 'block',
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '90vh',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          opacity: '80%'
        }}
      />
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 5px' }}>
        <Card
          title={titles[pathname]}
          extra={
            !['/login', '/no-role'].includes(pathname) && (
              <Button icon={<HomeOutlined />} type='primary' onClick={() => navigate('/login')} />
            )
          }
          style={{
            minWidth: breakpoints['xs'] ? '200px' : '400px',
            opacity: '75%',
            cursor: 'default'
          }}
        >
          <Outlet />
        </Card>
      </Content>
      <CustomFooter />
      <Drawer />
    </Layout>
  )
}
