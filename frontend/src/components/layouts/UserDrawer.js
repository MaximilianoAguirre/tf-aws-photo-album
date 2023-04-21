import React, { useState } from 'react'
import { Drawer, Button, Modal, Form, Input, Tag, List, Typography, Switch, Divider } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LogoutOutlined, EditOutlined, BulbOutlined } from '@ant-design/icons'

import { useAuth, useUserDrawer, useTheme } from 'context'

const { Text } = Typography

export const UserDrawer = () => {
  const [form] = Form.useForm()
  const { opened, close } = useUserDrawer()
  const { theme, setTheme } = useTheme()
  const { userId, logout, isLoggingOut, changePassword, isChangingPassword, userRole, user } = useAuth()
  const [changePwdModal, setChangePwdModal] = useState(false)

  return (
    <Drawer
      title={userId}
      open={opened}
      placement='left'
      onClose={() => close()}
      footer={
        <>
          <div style={{ marginTop: '10px' }}>
            <Text>Dark mode:</Text>
            <Switch
              style={{ marginLeft: '15px' }}
              checked={theme === 'light'}
              onChange={(checked) => setTheme(checked ? 'light' : 'dark')}
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
            />
          </div>
          <Divider />
          <Button onClick={() => setChangePwdModal(true)} style={{ width: '100%', marginBottom: '10px' }} icon={<EditOutlined />}>
            Change my password
          </Button>
          <Button onClick={() => logout()} loading={isLoggingOut} type='primary' danger style={{ width: '100%' }} icon={<LogoutOutlined />}>
            Logout
          </Button>
        </>
      }
    >
      <List
        itemLayout='vertical'
        renderItem={(item) => <List.Item>{item}</List.Item>}
        dataSource={[
          <>
            ID:{' '}
            <Text italic copyable>
              {user.username}
            </Text>
          </>,
          <>
            Role: <Tag color='blue'>{capitalize(userRole)}</Tag>
          </>
        ]}
      />
      <Modal
        title='Change my password'
        okText='Change it'
        open={changePwdModal}
        maskClosable={!isChangingPassword}
        onCancel={() => {
          form.resetFields()
          setChangePwdModal(false)
        }}
        okButtonProps={{
          type: 'primary',
          htmlType: 'submit',
          form: 'change-password',
          icon: <CheckCircleOutlined />,
          loading: isChangingPassword
        }}
        cancelButtonProps={{
          danger: true,
          disabled: isChangingPassword,
          icon: <CloseCircleOutlined />
        }}
      >
        <Form
          name='change-password'
          form={form}
          onFinish={(values) => {
            changePassword({
              ...values,
              callback: () => {
                form.resetFields()
                setChangePwdModal(false)
              }
            })
          }}
        >
          <Form.Item label='Old password' name='old_password' hasFeedback rules={[{ required: true }]}>
            <Input.Password autoComplete='off' />
          </Form.Item>
          <Form.Item
            label='New password'
            name='new_password'
            hasFeedback
            rules={[{ required: true }, { type: 'string' }, { whitespace: true }, { min: 10 }]}
          >
            <Input.Password autoComplete='off' />
          </Form.Item>
          <Form.Item
            label='Confirm password'
            name='confirm_password'
            hasFeedback
            dependencies={['new_password']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject('Passwords do not match!')
                }
              })
            ]}
          >
            <Input.Password autoComplete='off' />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  )
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
