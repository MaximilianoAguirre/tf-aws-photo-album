import React from "react"
import { Spin } from "antd"
import Icon from "@ant-design/icons"

import { ReactComponent as logo } from "images/logo.svg"

export const CustomSpinner = ({ size }) => {
    return <Spin
        style={{ alignSelf: "center" }}
        indicator={<Icon
            component={logo}
            style={{ fontSize: size || 48 }}
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
        <CustomSpinner />
    </div>
}
