import React from "react"

// Context providers
import { ReactQueryProvider } from "./react_query"
import { AuthProvider } from "./auth"
import { AntdProvider } from "./antd"
import { UserDrawerProvider } from "./user_drawer"
import { ThemeProvider } from "./theme"
import { ImageSizeProvider } from "./image_size"

export function Providers({ children }) {
    return <AuthProvider>
        <ReactQueryProvider>
            <ThemeProvider>
                <AntdProvider>
                    <UserDrawerProvider>
                        <ImageSizeProvider>
                            {children}
                        </ImageSizeProvider>
                    </UserDrawerProvider>
                </AntdProvider>
            </ThemeProvider>
        </ReactQueryProvider>
    </AuthProvider>
}

export default Providers;
