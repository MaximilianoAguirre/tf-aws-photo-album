import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from 'context/auth'

export const ContributorRoute = ({ children }) => {
  const { userRoles } = useAuth()

  const filtered_roles = userRoles?.filter((role) => ['admin', 'contributor'].includes(role))

  if (filtered_roles?.length) {
    return children
  } else {
    return <Navigate to={'/'} replace />
  }
}
