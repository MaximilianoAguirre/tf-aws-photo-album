import React from "react"
import { Layout, Typography, Row, Col } from 'antd'

import { ChooseSizeRadio } from "components"

const { Header } = Layout
const { Title } = Typography

export const StickyHeader = ({ children, chooseSize = true, title }) => {
    return <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', padding: "0px 5px" }}>
        <Row
            align="middle"
            gutter={[10, 10]}
        >
            {title && <Col flex="auto"><Title style={{ color: "white", marginTop: "11px" }} level={2}>{title}</Title></Col>}
            {children}
            {
                chooseSize && <Col flex="100px"><ChooseSizeRadio /></Col>
            }
        </Row>
    </Header>
}
