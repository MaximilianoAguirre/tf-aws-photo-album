import React from "react"
import { Layout } from 'antd'
import { Outlet } from "react-router-dom"

import { CustomHeader } from "components"
import { CustomFooter } from "components"

const { Content } = Layout;


export const MainLayout = () => {
    return <Layout style={{ minHeight: "100vh" }}>
        <CustomHeader />
        <Content>
            <Outlet />
        </Content>
        <CustomFooter />
    </Layout>
}
