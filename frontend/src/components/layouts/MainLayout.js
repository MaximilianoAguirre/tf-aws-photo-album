import React, { useState } from "react"
import { Layout } from 'antd'
import { Outlet } from "react-router-dom"

import { CustomHeader, CustomFooter, UserDrawer } from "components"

const { Content } = Layout;

export const MainLayout = () => {
    const [userDrawerOpen, setUserDrawerOpen] = useState(false)

    return <Layout style={{ minHeight: "100vh" }}>
        <CustomHeader openUserDrawer={() => setUserDrawerOpen(true)} />
        <Content>
            <Outlet />
        </Content>
        <CustomFooter />
        <UserDrawer opened={userDrawerOpen} close={() => setUserDrawerOpen(false)} />
    </Layout>
}
