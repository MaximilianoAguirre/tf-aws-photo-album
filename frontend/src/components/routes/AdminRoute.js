import React from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "context/auth"

export const AdminRoute = ({ children }) => {
  const { userRoles } = useAuth()

  const filtered_roles = userRoles?.filter(role => ["admin"].includes(role))

  if (filtered_roles?.length) {
    return children
  }
  else {
    return <Navigate to={"/"} replace />
  }
}
