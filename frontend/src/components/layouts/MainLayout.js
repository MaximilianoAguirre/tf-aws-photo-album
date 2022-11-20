import React from "react"
import { Layout  } from 'antd'
import { Outlet, useLocation } from "react-router-dom"

import { CustomSider, CustomFooter, UserDrawer } from "components"

const { Content } = Layout

const footer_exceptions = ["/map"]

export const MainLayout = () => {
    const { pathname } = useLocation()

    return <Layout style={{ minHeight: "100vh" }}>
        <CustomSider />
        <Layout style={{ marginLeft: 80 }}>
            <Content>
                <Outlet />
            </Content>
            {
                !footer_exceptions.includes(pathname) && <CustomFooter />
            }
            <UserDrawer />
        </Layout>
    </Layout>
}
