import React from "react"
import { Button, Layout, Menu } from 'antd'
import { GlobalOutlined, CameraOutlined, TeamOutlined, UserOutlined, BulbOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import { useUserDrawer, useTheme } from "context"

import Asd from "images/logo.png"


const { Sider } = Layout

export const CustomSider = () => {
    const { theme, setTheme } = useTheme()
    const { open } = useUserDrawer()
    const location = useLocation()
    const navigate = useNavigate()

    const pages = [
        {
            key: "/photos",
            path: "/photos",
            icon: <CameraOutlined />,
        },
        {
            key: "/map",
            path: "/map",
            icon: <GlobalOutlined />,
        },
        {
            key: "/persons",
            path: "/persons",
            icon: <TeamOutlined />
        }
    ]

    return <Sider
        collapsed={true}
        width={50}
        style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,

        }}
    >
        <img src={Asd} style={{width: "46px", margin: "5px 17px"}} />

        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={pages.filter(item => location.pathname.startsWith(item.key)).map(item => item.key)}
            items={pages}
            onSelect={({ key }) => navigate(key)}
            style={{ marginTop: "5px" }}
        />

        <div
            style={{
                position: "fixed",
                bottom: 0,
                width: "80px",
                padding: "5px"
            }}
        >
            <Button
                icon={<BulbOutlined />}
                style={{ marginBottom: "5px", width: "100%" }}
                type={theme === "dark" ? "default" : "primary"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <Button
                icon={<UserOutlined />}
                type="primary"
                onClick={() => open()}
                style={{ width: "100%" }}
            />
        </div>
    </Sider>
}
