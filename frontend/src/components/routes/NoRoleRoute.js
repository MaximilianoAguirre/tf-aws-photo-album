import React from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "context/auth"

export const NoRoleRoute = ({ children }) => {
  const { userRoles } = useAuth()

  if (!userRoles) {
    return children
  }
  else {
    return <Navigate to={"/"} replace />
  }
}
