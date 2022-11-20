import React, { useState } from "react"
import { Layout } from 'antd'
import { Outlet, useLocation } from "react-router-dom"

import { CustomHeader, CustomFooter, UserDrawer } from "components"

const { Content } = Layout

const footer_exceptions = ["/map"]

export const MainLayout = () => {
    const { pathname } = useLocation()
    const [userDrawerOpen, setUserDrawerOpen] = useState(false)

    return <Layout style={{ minHeight: "100vh" }}>
        <CustomHeader openUserDrawer={() => setUserDrawerOpen(true)} />
        <Content>
            <Outlet />
        </Content>
        {
            !footer_exceptions.includes(pathname) && <CustomFooter />
        }
        <UserDrawer opened={userDrawerOpen} close={() => setUserDrawerOpen(false)} />
    </Layout>
}
