import React, { useState } from 'react'
import { Input, Tooltip, Avatar, Tag, Button, Dropdown, message, Col, Row, Card, Modal, Form } from 'antd'
import {
  MailOutlined,
  UserOutlined,
  DeleteOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'

import {
  useAllUsersInfinite,
  useAllUserGroups,
  useDeleteUser,
  useCreateUser,
  useChangeUserRole,
  useEnableUser,
  useDisableUser
} from 'api/cognito'
import { StickyHeader, WrappedSpinner, CustomSpinner } from 'components'
import { get_user_roles, useAuth } from 'context/auth'
import { queryClient } from 'context'

const { Meta } = Card

export const AllUsers = () => {
  const { user } = useAuth()
  const { data, isLoading, fetchNextPage, hasNextPage } = useAllUsersInfinite()
  const [userCreateOpen, setUserCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const users = data?.pages
    .reduce((acc, curr) => {
      return acc.concat(curr.Users)
    }, [])
    .filter((User) => User.Username !== user.username)

  const createUser = useCreateUser({
    onSuccess: () => {
      message.success(`User created`)
      form.resetFields()
      queryClient.resetQueries(['all-users-infinite'])
      setUserCreateOpen(false)
    },
    onError: (error) => {
      message.error(error.message)
    }
  })

  return (
    <>
      <StickyHeader chooseSize={false} title='Users'>
        <Col flex='80px'>
          <Button type='primary' icon={<UserAddOutlined />} onClick={() => setUserCreateOpen(true)}>
            Invite user
          </Button>
        </Col>
      </StickyHeader>
      {isLoading ? (
        <WrappedSpinner />
      ) : (
        <InfiniteScroll
          style={{ padding: '15px' }}
          height='calc(100vh - 56px)'
          dataLength={users.length}
          hasChildren={users.length}
          hasMore={hasNextPage}
          next={() => fetchNextPage()}
          loader={<CustomSpinner />}
        >
          <Row gutter={[10, 10]} style={{ margin: 0, width: '100%' }}>
            {users.map((user) => {
              const email = user.Attributes.find((attr) => attr.Name === 'email').Value
              const status = capitalize(user.UserStatus.replaceAll('_', ' '))

              return (
                <Col key={email}>
                  <Card
                    extra={[<UserRoleDropdown key='dropdown' user_id={user.Username} />]}
                    title={email}
                    actions={[
                      <EnableUserButton key='enableButton' user_id={user.Username} user_enabled={user.Enabled} />,
                      <DeleteUserButton key='deleteButtom' user_id={user.Username} />
                    ]}
                  >
                    <Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: user.Enabled ? 'green' : 'red' }} shape='square' />}
                      description={
                        <>
                          <Tag>{status}</Tag> {!user.Enabled && <Tag color='red'>Disabled</Tag>}
                        </>
                      }
                    />
                  </Card>
                </Col>
              )
            })}
          </Row>
        </InfiniteScroll>
      )}
      <Modal
        title='Invite user'
        open={userCreateOpen}
        okText='Send invite'
        onCancel={() => {
          setUserCreateOpen(false)
          form.resetFields()
        }}
        okButtonProps={{
          type: 'primary',
          htmlType: 'submit',
          form: 'create-user',
          icon: <MailOutlined />,
          loading: createUser.isLoading
        }}
        cancelButtonProps={{
          danger: true,
          disabled: createUser.isLoading,
          icon: <CloseCircleOutlined />
        }}
      >
        <Form name='create-user' form={form} onFinish={(values) => createUser.mutate(values)}>
          <Form.Item label='Email' name='email' hasFeedback rules={[{ required: true }, { type: 'email' }]}>
            <Input prefix={<MailOutlined />} autoComplete='off' autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

const DeleteUserButton = ({ user_id }) => {
  const deleteUser = useDeleteUser({
    onSuccess: () => {
      message.success(`User deleted`)
      queryClient.resetQueries(['all-users-infinite'])
    },
    onError: (error) => {
      message.error(error.message)
    }
  })

  return deleteUser.isLoading ? (
    <LoadingOutlined />
  ) : (
    <Tooltip title='Delete'>
      <DeleteOutlined onClick={() => deleteUser.mutate(user_id)} />
    </Tooltip>
  )
}

const EnableUserButton = ({ user_id, user_enabled }) => {
  const enableUser = useEnableUser({
    onSuccess: () => {
      message.success(`User enabled`)
      queryClient.resetQueries(['all-users-infinite'])
    },
    onError: (error) => {
      message.error(error.message)
    }
  })

  const disableUser = useDisableUser({
    onSuccess: () => {
      message.success(`User disabled`)
      queryClient.resetQueries(['all-users-infinite'])
    },
    onError: (error) => {
      message.error(error.message)
    }
  })

  return enableUser.isLoading || disableUser.isLoading ? (
    <LoadingOutlined />
  ) : !user_enabled ? (
    <Tooltip title='Enable'>
      <CheckCircleOutlined onClick={() => enableUser.mutate(user_id)} />
    </Tooltip>
  ) : (
    <Tooltip title='Disable'>
      <CloseCircleOutlined onClick={() => disableUser.mutate(user_id)} />
    </Tooltip>
  )
}

const UserRoleDropdown = ({ user_id }) => {
  const { data, isLoading } = useAllUserGroups(user_id)
  const role = !isLoading && get_user_roles(data.map((group) => group.GroupName))

  const changeUserRole = useChangeUserRole({
    onSuccess: () => {
      message.success(`User role changed`)
      queryClient.resetQueries(['user-groups', user_id])
    },
    onError: (error) => {
      message.error(error.message)
    }
  })

  return (
    <Dropdown
      disabled={isLoading}
      menu={{
        items: [
          {
            label: 'Admin',
            key: 'admin',
            disabled: role === 'admin'
          },
          {
            label: 'Contributor',
            key: 'contributor',
            disabled: role === 'contributor'
          },
          {
            label: 'Reader',
            key: 'reader',
            disabled: role === 'reader'
          },
          {
            label: 'None',
            key: 'none',
            disabled: role === 'none'
          }
        ],
        onClick: ({ key }) => changeUserRole.mutate({ user_id, old_group: role, new_group: key })
      }}
    >
      <Button style={{ marginLeft: '5px' }} type='primary' icon={<UserSwitchOutlined />} loading={isLoading || changeUserRole.isLoading}>
        {(role && capitalize(role)) || 'Loading...'}
      </Button>
    </Dropdown>
  )
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
