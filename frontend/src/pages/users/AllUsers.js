import React, { useState } from "react"
import { Input, List, Avatar, Tag, Button, Dropdown, Grid, message, Typography, Col, Modal, Form } from 'antd'
import { MailOutlined, UserOutlined, DeleteOutlined, SyncOutlined, UserSwitchOutlined, UserAddOutlined, CloseCircleOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllUsersInfinite, useAllUserGroups, useDeleteUser, useCreateUser, useChangeUserRole } from "api/cognito"
import { StickyHeader, WrappedSpinner, CustomSpinner } from "components"
import { get_user_roles, useAuth } from "context/auth"
import { queryClient } from "context"

const { useBreakpoint } = Grid
const { Text } = Typography

export const AllUsers = () => {
    const breakpoints = useBreakpoint()
    const { user } = useAuth()
    const { data, isLoading, fetchNextPage, hasNextPage } = useAllUsersInfinite()
    const [userCreateOpen, setUserCreateOpen] = useState(false)
    const [form] = Form.useForm()

    const users = data?.pages.reduce((acc, curr) => {
        return acc.concat(curr.Users)
    }, [])

    const createUser = useCreateUser({
        onSuccess: (data, variables, context) => {
            message.success(`User created`)
            form.resetFields()
            queryClient.resetQueries(["all-users-infinite"])
            setUserCreateOpen(false)
        },
        onError: (error, variables, context) => {
            message.error(error.message)
        }
    })

    return <>
        <StickyHeader chooseSize={false} title="Users">
            <Col flex="80px">
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setUserCreateOpen(true)}
                >
                    Invite user
                </Button>
            </Col>
        </StickyHeader>
        {
            isLoading ?
                <WrappedSpinner />
                :
                <InfiniteScroll
                    style={{ width: "100%", padding: "5px" }}
                    height="calc(100vh - 56px)"
                    dataLength={users.length}
                    hasChildren={users.length}
                    hasMore={hasNextPage}
                    next={() => fetchNextPage()}
                    loader={<CustomSpinner />}
                >
                    <List
                        itemLayout={breakpoints["md"] ? "horizontal" : "vertical"}
                        style={{ margin: "15px" }}
                        dataSource={users}
                        renderItem={item => <List.Item
                            actions={[
                                <UserRoleDropdown
                                    disabled={item.Username === user.username}
                                    user_id={item.Username}
                                />,
                                <DeleteUserButton
                                    disabled={item.Username === user.username}
                                    user_id={item.Username}
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                title={item.Attributes.find(attr => attr.Name === "email").Value}
                                avatar={<Avatar
                                    icon={!(item.Username === user.username) && <UserOutlined />}
                                    style={item.Username === user.username && { backgroundColor: "green" }}
                                >
                                    {item.Username === user.username && "ME"}
                                </Avatar>}
                                description={<List
                                    itemLayout="vertical"
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                    dataSource={[
                                        <>ID: <Text italic copyable>{item.Username}</Text></>,
                                        <>Account status: <Tag>{capitalize(item.UserStatus.replaceAll("_", " "))}</Tag></>,
                                        <>Role: <UserRole user_id={item.Username} /></>
                                    ]}
                                />}
                            />
                        </List.Item>}
                    />
                </InfiniteScroll>
        }
        <Modal
            title="Invite user"
            open={userCreateOpen}
            okText="Send invite"
            onCancel={() => {
                setUserCreateOpen(false)
                form.resetFields()
            }}
            okButtonProps={{
                type: "primary",
                htmlType: "submit",
                form: "create-user",
                icon: <MailOutlined />,
                loading: createUser.isLoading
            }}
            cancelButtonProps={{
                danger: true,
                disabled: createUser.isLoading,
                icon: <CloseCircleOutlined />
            }}
        >
            <Form
                name="create-user"
                form={form}
                onFinish={(values) => createUser.mutate(values)}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    hasFeedback
                    rules={[
                        { required: true },
                        { type: "email" }
                    ]}
                >
                    <Input prefix={<MailOutlined />} autoComplete="off" autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    </>
}

const DeleteUserButton = ({ user_id, disabled }) => {
    const deleteUser = useDeleteUser({
        onSuccess: (data, variables, context) => {
            message.success(`User deleted`)
            queryClient.resetQueries(["all-users-infinite"])
        },
        onError: (error, variables, context) => {
            message.error(error.message)
        }
    })

    return <Button
        danger
        type="primary"
        icon={<DeleteOutlined />}
        disabled={disabled}
        loading={deleteUser.isLoading}
        onClick={() => deleteUser.mutate(user_id)}
    >
        Delete
    </Button>
}

const UserRoleDropdown = ({ user_id, disabled }) => {
    const { data, isLoading } = useAllUserGroups(user_id)
    const role = !isLoading && get_user_roles(data.map(group => group.GroupName))

    const changeUserRole = useChangeUserRole({
        onSuccess: (data, variables, context) => {
            message.success(`User role changed`)
            queryClient.resetQueries(["user-groups", user_id])
        },
        onError: (error, variables, context) => {
            message.error(error.message)
        }
    })

    return <Dropdown
        disabled={disabled || isLoading}
        menu={{
            items: [
                {
                    label: "Admin",
                    key: "admin",
                    disabled: role === "admin"
                },
                {
                    label: "Contributor",
                    key: "contributor",
                    disabled: role === "contributor"
                },
                {
                    label: "Reader",
                    key: "reader",
                    disabled: role === "reader"
                },
                {
                    label: "None",
                    key: "none",
                    disabled: role === "none"
                },
            ],
            onClick: ({ key }) => changeUserRole.mutate({ user_id, old_group: role, new_group: key })
        }}
    >
        <Button
            type="primary"
            icon={<UserSwitchOutlined />}
            loading={isLoading || changeUserRole.isLoading}
        >
            Change role
        </Button>
    </Dropdown>
}

const UserRole = ({ user_id }) => {
    const { data, isLoading } = useAllUserGroups(user_id)
    const role = !isLoading && get_user_roles(data.map(group => group.GroupName))

    return <Tag icon={isLoading && <SyncOutlined spin />} color="blue">{role ? capitalize(role) : "Loading..."}</Tag>
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
