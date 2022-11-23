import React, { useState } from 'react'
import { Drawer, Button, Modal, Form, Input, Tag } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LogoutOutlined, EditOutlined } from '@ant-design/icons'

import { useAuth, useUserDrawer } from 'context'

export const UserDrawer = () => {
  const [form] = Form.useForm()
  const { opened, close } = useUserDrawer()
  const { userId, logout, isLoggingOut, changePassword, isChangingPassword, userRole } = useAuth()
  const [changePwdModal, setChangePwdModal] = useState(false)

  return (
    <Drawer
      title={
        <>
          {userId} <Tag>{userRole}</Tag>
        </>
      }
      open={opened}
      onClose={() => close()}
      footer={
        <>
          <Button onClick={() => setChangePwdModal(true)} style={{ width: '100%', marginBottom: '10px' }} icon={<EditOutlined />}>
            Change my password
          </Button>
          <Button onClick={() => logout()} loading={isLoggingOut} type='primary' danger style={{ width: '100%' }} icon={<LogoutOutlined />}>
            Logout
          </Button>
        </>
      }
    >
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
