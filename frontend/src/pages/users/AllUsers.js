import React, { useState } from 'react'
import { Input, List, Avatar, Tag, Button, Dropdown, Grid, message, Typography, Col, Modal, Form } from 'antd'
import {
  MailOutlined,
  UserOutlined,
  DeleteOutlined,
  SyncOutlined,
  UserSwitchOutlined,
  UserAddOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined
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

const { useBreakpoint } = Grid
const { Text } = Typography

export const AllUsers = () => {
  const breakpoints = useBreakpoint()
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
          style={{ width: '100%', padding: '5px' }}
          height='calc(100vh - 56px)'
          dataLength={users.length}
          hasChildren={users.length}
          hasMore={hasNextPage}
          next={() => fetchNextPage()}
          loader={<CustomSpinner />}
        >
          <List
            itemLayout={breakpoints['md'] ? 'horizontal' : 'vertical'}
            style={{ margin: '15px' }}
            dataSource={users}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <UserRoleDropdown key='dropdown' user_id={item.Username} />,
                  <EnableUserButton key='enableButton' user_id={item.Username} user_enabled={item.Enabled} />,
                  <DeleteUserButton key='deleteButtom' user_id={item.Username} />
                ]}
              >
                <List.Item.Meta
                  title={item.Attributes.find((attr) => attr.Name === 'email').Value}
                  avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: item.Enabled ? 'green' : 'red' }} shape='square' />}
                  description={
                    <List
                      itemLayout='vertical'
                      renderItem={(item) => <List.Item>{item}</List.Item>}
                      dataSource={[
                        <>
                          ID:{' '}
                          <Text italic copyable>
                            {item.Username}
                          </Text>
                        </>,
                        <>
                          Account status:{' '}
                          <>
                            <Tag>{capitalize(item.UserStatus.replaceAll('_', ' '))}</Tag> {!item.Enabled && <Tag color='red'>Disabled</Tag>}
                          </>
                        </>,
                        <>
                          Role: <UserRole user_id={item.Username} />
                        </>
                      ]}
                    />
                  }
                />
              </List.Item>
            )}
          />
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

  return (
    <Button danger type='primary' icon={<DeleteOutlined />} loading={deleteUser.isLoading} onClick={() => deleteUser.mutate(user_id)}>
      Delete
    </Button>
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

  return (
    <Button
      danger={user_enabled}
      type='primary'
      icon={!user_enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
      style={!user_enabled ? { backgroundColor: 'green' } : {}}
      loading={enableUser.isLoading || disableUser.isLoading}
      onClick={() => (user_enabled ? disableUser.mutate(user_id) : enableUser.mutate(user_id))}
    >
      {user_enabled ? 'Disable' : 'Enable'}
    </Button>
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
      <Button type='primary' icon={<UserSwitchOutlined />} loading={isLoading || changeUserRole.isLoading}>
        Change role
      </Button>
    </Dropdown>
  )
}

const UserRole = ({ user_id }) => {
  const { data, isLoading } = useAllUserGroups(user_id)
  const role = !isLoading && get_user_roles(data.map((group) => group.GroupName))

  return (
    <Tag icon={isLoading && <SyncOutlined spin />} color='blue'>
      {role ? capitalize(role) : 'Loading...'}
    </Tag>
  )
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
