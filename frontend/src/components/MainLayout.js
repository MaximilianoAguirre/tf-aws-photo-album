import React from "react"
import { Layout } from 'antd'
import { Outlet } from "react-router-dom"

import { CustomHeader } from "components/Header"
import { CustomFooter } from "components/Footer"

const { Content } = Layout;


export const Main = () => {
    return <Layout style={{ minHeight: "100vh" }}>
        <CustomHeader />
        <Content>
            <Outlet />
        </Content>
        <CustomFooter />
    </Layout>
}
