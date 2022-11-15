import React from "react"
import { Layout, Menu, Button } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from "context/auth"

const { Header } = Layout

export const CustomHeader = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { userId } = useAuth()

    const pages = [
        {
            key: "/photos",
            path: "/photos",
            label: "All photos"
        },
        {
            key: "/map",
            path: "/map",
            label: "Map"
        }
    ]

    return (
        <Header>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={pages.filter(item => location.pathname.startsWith(item.key)).map(item => item.key)}
                items={pages}
                onSelect={({ key }) => navigate(key)}
            />
            <Button>{userId}</Button>
        </Header>
    )
}
