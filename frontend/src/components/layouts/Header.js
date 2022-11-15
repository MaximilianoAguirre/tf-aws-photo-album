import React from "react"
import { Layout, Menu, Button, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'


const { Header } = Layout

export const CustomHeader = ({ openUserDrawer }) => {
    const location = useLocation()
    const navigate = useNavigate()

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

    return <Header>
        <Row>
            <Col flex="auto">
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={pages.filter(item => location.pathname.startsWith(item.key)).map(item => item.key)}
                    items={pages}
                    onSelect={({ key }) => navigate(key)}
                />
            </Col>
            <Col flex={"32px"}>
                <Button
                    icon={<UserOutlined />}
                    type="primary"
                    onClick={() => openUserDrawer()}
                />
            </Col>
        </Row>
    </Header>
}
