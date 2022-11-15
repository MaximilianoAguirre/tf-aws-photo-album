import React from "react"

// Context providers
import { ReactQueryProvider } from "context/react_query"
import { AuthProvider } from "context/auth"

export function Providers({ children }) {
    return <AuthProvider>
        <ReactQueryProvider>
            {children}
        </ReactQueryProvider>
    </AuthProvider>
}

export default Providers;
