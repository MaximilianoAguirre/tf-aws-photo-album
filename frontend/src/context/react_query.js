import React from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from 'react-query'

const queryCache = new QueryCache()

export const queryClient = new QueryClient({
  queryCache: queryCache,
  defaultOptions: {
    queries: {}
  }
})

export function ReactQueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
