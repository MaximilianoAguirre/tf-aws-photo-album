import React from "react"
import { List, Avatar, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllUsersInfinite } from "api/cognito"
import { StickyHeader, WrappedSpinner, CustomSpinner } from "components"

export const AllUsers = () => {
    const { data, isLoading, fetchNextPage, hasNextPage } = useAllUsersInfinite()

    const users = data?.pages.reduce((acc, curr) => {
        return acc.concat(curr.Users)
    }, [])

    return <>
        <StickyHeader chooseSize={false} title="Users" />
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
                        itemLayout="horizontal"
                        style={{ margin: "15px" }}
                        dataSource={users}
                        renderItem={item => <List.Item
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={item.Attributes.find(attr => attr.Name === "email").Value}
                                description={<Tag>{item.UserStatus}</Tag>}
                            />
                        </List.Item>}
                    />
                </InfiniteScroll>
        }
    </>
}
