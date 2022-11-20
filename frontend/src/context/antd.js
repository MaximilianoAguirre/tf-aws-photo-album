import React from "react"
import { ConfigProvider, theme } from "antd"

const { darkAlgorithm, compactAlgorithm } = theme;

export function AntdProvider({ children }) {
    return <ConfigProvider
        form={{
            validateMessages: {
                required: "${label} required"
            },
            requiredMark: false
        }}
        theme={{
            algorithm: [darkAlgorithm, compactAlgorithm]
        }}
    >
        {children}
    </ConfigProvider>
}
