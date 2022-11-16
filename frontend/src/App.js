import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ReactQueryDevtools } from "react-query/devtools"

import { MainLayout, LoginLayout, PrivateRoute, PublicRoute } from "components"
import { AllPhotos, Located, Map, Login, SetPassword, ForgotPassword } from "pages"
import { Providers } from "context/providers_wrapper"

export const App = () => {
  return (
    <Router>
      <Providers>
        <Routes>

          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="photos" element={<AllPhotos />} />
            <Route path="map" element={<Map />} />
            <Route path="located/:geohash" element={<Located />} />
            <Route path="*" element={<Navigate to="/photos" />} />
            <Route index element={<Navigate to="/photos" />} />
          </Route>

          <Route path="/login" element={<PublicRoute><LoginLayout /></PublicRoute>} >
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="set-password" element={<SetPassword />} />
            <Route index element={<Login />} />
          </Route>

        </Routes>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </Providers>
    </Router>
  )
}
