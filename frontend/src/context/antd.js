import React from "react"
import { ConfigProvider, theme } from "antd"

import { useTheme } from "./theme"

const { darkAlgorithm, compactAlgorithm, defaultAlgorithm } = theme

export function AntdProvider({ children }) {
    const { theme } = useTheme()
    return <ConfigProvider
        form={{
            validateMessages: {
                required: "${label} required",
                whitespace: "${label} cannot be empty",
                string: {
                    min: "${label} must have at least ${min} chars"
                },
                types: {
                    email: "Must be a valid email"
                }
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
