import React from "react"

// Context providers
import { ReactQueryProvider } from "./react_query"
import { AuthProvider } from "./auth"
import { AntdProvider } from "./antd"

export function Providers({ children }) {
    return <AuthProvider>
        <ReactQueryProvider>
            <AntdProvider>
                {children}
            </AntdProvider>
        </ReactQueryProvider>
    </AuthProvider>
}

export default Providers;
