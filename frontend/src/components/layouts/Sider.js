import React from 'react'
import { Button, Layout, Menu, Badge } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { MdOutlineVideoCameraFront } from 'react-icons/md'

import {
  GlobalOutlined,
  CameraOutlined,
  TeamOutlined,
  UserOutlined,
  FileAddOutlined,
  LineChartOutlined,
  DollarCircleOutlined
} from '@ant-design/icons'

import { useUserDrawer, useAuth } from 'context'

import logo from 'images/logo.png'

const { Sider } = Layout

const reader_items = [
  {
    key: '/photos',
    path: '/photos',
    label: 'All photos',
    icon: <CameraOutlined />
  },
  {
    key: '/map',
    path: '/map',
    label: 'Map',
    icon: <GlobalOutlined />
  },
  {
    key: '/persons',
    path: '/persons',
    label: 'People in photos',
    icon: <MdOutlineVideoCameraFront size={18} />
  }
]

const contributor_items = [
  {
    type: 'divider'
  },
  {
    key: '/contributor/upload',
    path: '/contributor/upload',
    label: 'Upload',
    icon: <FileAddOutlined />
  }
]

const admin_items = [
  {
    type: 'divider'
  },
  {
    key: '/admin/users',
    path: '/admin/users',
    label: 'User list',
    icon: <TeamOutlined />
  },
  {
    key: '/admin/usage',
    path: '/admin/usage',
    label: 'Usage',
    icon: <LineChartOutlined />
  },
  {
    key: '/admin/budget',
    path: '/admin/budget',
    label: 'Budget',
    icon: <DollarCircleOutlined />
  }
]

export const CustomSider = () => {
  const { userRole } = useAuth()
  const { open } = useUserDrawer()
  const location = useLocation()
  const navigate = useNavigate()

  const pages = [
    ...reader_items,
    ...(userRole === 'admin' || userRole === 'contributor' ? contributor_items : []),
    ...(userRole === 'admin' ? admin_items : [])
  ]

  return (
    <Sider
      collapsed={true}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0
      }}
    >
      <img src={logo} alt='logo' style={{ width: '46px', margin: '5px 17px' }} />
      <Menu
        theme='dark'
        mode='inline'
        selectedKeys={pages.filter((item) => location.pathname.startsWith(item.key)).map((item) => item.key)}
        items={pages}
        onSelect={({ key }) => navigate(key)}
        style={{ marginTop: '5px', marginLeft: '5px' }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '80px',
          padding: '5px'
        }}
      >
        <Button icon={<UserOutlined />} type='primary' onClick={() => open()} style={{ width: '100%' }} />
      </div>
    </Sider>
  )
}
