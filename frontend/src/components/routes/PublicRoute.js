import React from "react"
import { Navigate } from "react-router-dom"
import { useQueryClient } from "react-query"

import { useAuth } from "context/auth"

export const PublicRoute = ({children}) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  if (!isAuthenticated) {
    // Close websocket connection and clear cache
    queryClient.clear()

    return children
  }
  else {
    return <Navigate to="/photos" />
  }
}
