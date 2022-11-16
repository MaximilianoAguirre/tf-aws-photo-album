import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useQueryClient } from "react-query"

import { useAuth } from "context/auth"

export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()

  const from = location.state?.from || "/"

  if (!isAuthenticated) {
    // Close websocket connection and clear cache
    queryClient.clear()

    return children
  }
  else {
    return <Navigate
      to={from}
      replace
    />
  }
}
