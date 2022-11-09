import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import { Main } from "components/MainLayout"
import { AllPhotos } from "pages/AllPhotos"
import { Map } from "pages/Map"

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="photos" element={<AllPhotos />} />
          <Route path="map" element={<Map />} />
          <Route path="*" element={<Navigate to="/photos" />} />
        </Route>
        <Route path="*" element={<Navigate to="/photos" />} />
      </Routes>
    </Router>
  )
}
