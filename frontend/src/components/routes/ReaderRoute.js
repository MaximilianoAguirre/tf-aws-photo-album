import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from 'context/auth'

export const ReaderRoute = ({ children }) => {
  const { userRoles } = useAuth()

  const filtered_roles = userRoles?.filter((role) => ['admin', 'contributor', 'reader'].includes(role))

  if (filtered_roles?.length) {
    return children
  } else {
    return <Navigate to={'/no-role'} replace />
  }
}
