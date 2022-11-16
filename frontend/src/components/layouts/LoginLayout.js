import React from "react"
import { Layout, Grid, Card, Drawer, Button } from 'antd'
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { HomeOutlined } from "@ant-design/icons"

import { CustomFooter } from "components"

const { Content } = Layout
const { useBreakpoint } = Grid

const titles = {
    "/login": "Login",
    "/login/set-password": "Set password",
    "/login/forgot-password": "Reset password"
}

export const LoginLayout = () => {
    const breakpoints = useBreakpoint()
    const { pathname } = useLocation()
    const navigate = useNavigate()

    return <Layout style={{ minHeight: "100vh" }}>
        <Content
            style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 5px" }}
        >
            <Card
                title={titles[pathname]}
                extra={pathname !== "/login" && <Button
                    icon={<HomeOutlined />}
                    type="primary"
                    onClick={() => navigate("/login")}
                />}
                style={{
                    minWidth: breakpoints["xs"] ? "200px" : "400px",
                    opacity: "75%",
                    cursor: "default"
                }}
            >
                <Outlet />
            </Card>
        </Content>
        <CustomFooter />
        <Drawer />
    </Layout>
}
