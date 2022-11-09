import { QueryClient } from 'react-query'

export const queryClient = new QueryClient({defaultOptions: {
    queries: {
        // refetchInterval: 1000 * 5,
        // refetchIntervalInBackground: 1000 * 20
    }
}})
