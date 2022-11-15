import React from "react"
import { Layout, Grid, Card, Drawer } from 'antd'
import { Outlet, useLocation } from "react-router-dom"

import { CustomFooter } from "components"

const { Content } = Layout
const { useBreakpoint } = Grid

const titles = {
    "/login": "Login",
    "/login/new-password": "New password"
}

export const LoginLayout = () => {
    const breakpoints = useBreakpoint()
    const { pathname } = useLocation()

    return <Layout style={{ minHeight: "100vh" }}>
        <Content
            style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 5px" }}
        >
            <Card
                title={titles[pathname]}
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
