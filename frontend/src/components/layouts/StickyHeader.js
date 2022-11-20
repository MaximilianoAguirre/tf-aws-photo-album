import React from "react"
import { Layout, Typography } from 'antd'

import { ChooseSizeRadio } from "components"

const { Header } = Layout
const { Title } = Typography

export const StickyHeader = ({ children, chooseSize = true, title }) => {
    return <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', paddingTop: "11px" }}>
        {title && <Title level={2}>{title}</Title>}
        {children}
        {
            chooseSize && <ChooseSizeRadio style={{ position: "fixed", right: 14, top: 14 }} />
        }
    </Header>
}
