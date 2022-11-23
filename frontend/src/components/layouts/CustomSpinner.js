import React from "react"
import { Spin } from "antd"
import Icon from "@ant-design/icons"

import { ReactComponent as logo } from "images/logo.svg"

export const CustomSpinner = ({ iconStyle, style }) => {
    return <Spin
        style={style}
        indicator={<Icon
            component={logo}
            style={{ fontSize: 48, ...iconStyle }}
            spin
        />}
    />;
}

export const WrappedSpinner = () => {
    return <div
        style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <CustomSpinner style={{ alignSelf: "center" }} />
    </div>
}
