import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth, ROLES } from 'context/auth'

export const NoRoleRoute = ({ children }) => {
  const { userRole } = useAuth()

  if (userRole === ROLES.none) {
    return children
  } else {
    return <Navigate to={'/'} replace />
  }
}
