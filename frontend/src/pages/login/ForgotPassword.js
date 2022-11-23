import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { RetweetOutlined, SendOutlined, MailOutlined, NumberOutlined, LockOutlined } from '@ant-design/icons'
import { Auth } from 'aws-amplify'
import { useSearchParams, useNavigate } from 'react-router-dom'

export const ForgotPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const username = Form.useWatch('username', form)
  const [sendingCode, setSendingCode] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const initial_username = searchParams.get('username')

  return (
    <Form
      name='forgot-password'
      form={form}
      onFinish={({ username, code, new_password }) => {
        setChangingPassword(true)

        Auth.forgotPasswordSubmit(username, code, new_password)
          .then(() => {
            message.success('Password changed successfully')
            navigate('/login')
          })
          .catch((err) => message.error(err.message))
          .finally(() => setChangingPassword(false))
      }}
    >
      <Form.Item label='Email' name='username' initialValue={initial_username} hasFeedback rules={[{ required: true }, { type: 'email' }]}>
        <Input prefix={<MailOutlined />} autoComplete='email' autoFocus />
      </Form.Item>
      <Form.Item label='Code' name='code' hasFeedback rules={[{ required: true }]}>
        <Input prefix={<NumberOutlined />} autoComplete='off' />
      </Form.Item>
      <Form.Item
        label='New password'
        name='new_password'
        hasFeedback
        rules={[{ required: true }, { type: 'string' }, { whitespace: true }, { min: 10 }]}
      >
        <Input.Password prefix={<LockOutlined />} autoComplete='off' />
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
        <Input.Password prefix={<LockOutlined />} autoComplete='off' />
      </Form.Item>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Button.Group>
          <Button
            icon={<SendOutlined />}
            disabled={!username || changingPassword}
            loading={sendingCode}
            onClick={() => {
              setSendingCode(true)
              Auth.forgotPassword(username)
                .then(() => message.success('Code sent'))
                .catch((err) => message.error(err.message))
                .finally(() => setSendingCode(false))
            }}
          >
            Send code
          </Button>
          <Button icon={<RetweetOutlined />} type='primary' htmlType='submit' loading={changingPassword} disabled={sendingCode}>
            Reset password
          </Button>
        </Button.Group>
      </div>
    </Form>
  )
}
