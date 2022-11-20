import React from "react"
import { ConfigProvider, theme } from "antd"

import { useTheme } from "./theme"

const { darkAlgorithm, compactAlgorithm, defaultAlgorithm } = theme

export function AntdProvider({ children }) {
    const { theme } = useTheme()
    return <ConfigProvider
        form={{
            validateMessages: {
                required: "${label} required"
            },
            requiredMark: false
        }}
        theme={{
            algorithm: [theme === "dark" ? darkAlgorithm : defaultAlgorithm, compactAlgorithm],
            // token: {
            //     colorPrimary: '#9400d3'
            // }
        }}
    >
        {children}
    </ConfigProvider>
}
