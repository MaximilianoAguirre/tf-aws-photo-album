import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from 'context/auth'

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  let location = useLocation()

  if (isAuthenticated) {
    return children
  } else {
    return <Navigate to='/login' replace state={{ from: location }} />
  }
}
